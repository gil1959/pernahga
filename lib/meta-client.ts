/**
 * Meta Graph API client helpers — IG/FB/Threads OAuth + posting + DM.
 *
 * LOCKED v1.0 (2026-05-25). Source: Meta App Review prep.
 * Docs:
 *  - https://developers.facebook.com/docs/instagram-platform
 *  - https://developers.facebook.com/docs/threads
 *  - https://developers.facebook.com/docs/graph-api
 *
 * Token strategy:
 *  - Short-lived token from OAuth callback (1 hour).
 *  - Convert ke long-lived (60 hari) via fb_exchange_token.
 *  - Refresh sebelum expired pas dipake (TODO: scheduled refresher).
 */
import crypto from "node:crypto";

const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;
const THREADS_GRAPH = "https://graph.threads.net";

export interface ShortTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn?: number;
}

export interface LongTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number; // ~5184000 (60 hari)
}

export interface MetaPage {
  id: string;
  name: string;
  accessToken: string; // page-specific token, ga expired selama user kasih izin
  category?: string;
  instagramBusinessAccount?: {
    id: string;
    username: string;
    name?: string;
    profilePictureUrl?: string;
  } | null;
}

/**
 * Tukar authorization code ke short-lived access token (kira-kira 1 jam).
 */
export async function exchangeCodeForToken(args: {
  code: string;
  redirectUri: string;
  appId: string;
  appSecret: string;
}): Promise<ShortTokenResponse> {
  const params = new URLSearchParams({
    client_id: args.appId,
    client_secret: args.appSecret,
    redirect_uri: args.redirectUri,
    code: args.code,
  });
  const res = await fetch(`${GRAPH_BASE}/oauth/access_token?${params.toString()}`, {
    method: "GET",
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Meta token exchange gagal: ${data.error?.message || res.status}`);
  }
  return {
    accessToken: data.access_token,
    tokenType: data.token_type || "bearer",
    expiresIn: data.expires_in,
  };
}

/**
 * Tukar short-lived ke long-lived (60 hari).
 */
export async function getLongLivedToken(args: {
  shortToken: string;
  appId: string;
  appSecret: string;
}): Promise<LongTokenResponse> {
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: args.appId,
    client_secret: args.appSecret,
    fb_exchange_token: args.shortToken,
  });
  const res = await fetch(`${GRAPH_BASE}/oauth/access_token?${params.toString()}`);
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Meta long-lived token gagal: ${data.error?.message || res.status}`);
  }
  return {
    accessToken: data.access_token,
    tokenType: data.token_type || "bearer",
    expiresIn: data.expires_in || 0,
  };
}

/**
 * Ambil daftar FB Page yang dimiliki user, beserta IG Business account
 * yang terhubung (kalau ada).
 */
export async function getUserPages(args: { accessToken: string }): Promise<MetaPage[]> {
  const fields = [
    "id",
    "name",
    "category",
    "access_token",
    "instagram_business_account{id,username,name,profile_picture_url}",
  ].join(",");
  const url = `${GRAPH_BASE}/me/accounts?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(args.accessToken)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Meta /me/accounts gagal: ${data.error?.message || res.status}`);
  }
  const pages: MetaPage[] = (data.data || []).map((p: {
    id: string;
    name: string;
    category?: string;
    access_token: string;
    instagram_business_account?: {
      id: string;
      username: string;
      name?: string;
      profile_picture_url?: string;
    } | null;
  }) => ({
    id: p.id,
    name: p.name,
    accessToken: p.access_token,
    category: p.category,
    instagramBusinessAccount: p.instagram_business_account
      ? {
          id: p.instagram_business_account.id,
          username: p.instagram_business_account.username,
          name: p.instagram_business_account.name,
          profilePictureUrl: p.instagram_business_account.profile_picture_url,
        }
      : null,
  }));
  return pages;
}

/**
 * Verifikasi signature webhook Meta — header `X-Hub-Signature-256` =
 * `sha256=<hmac(rawBody, appSecret)>`. WAJIB pakai raw body, bukan parsed JSON.
 */
export function verifyWebhookSignature(args: {
  rawBody: string | Buffer;
  signature: string | null | undefined;
  appSecret: string;
}): boolean {
  if (!args.signature || !args.appSecret) return false;
  const expected = crypto
    .createHmac("sha256", args.appSecret)
    .update(args.rawBody)
    .digest("hex");
  const received = args.signature.startsWith("sha256=")
    ? args.signature.slice("sha256=".length)
    : args.signature;
  if (expected.length !== received.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(received, "hex"));
  } catch {
    return false;
  }
}

/**
 * Publish foto ke Instagram Business via 2-step container flow.
 * Returns Instagram media id.
 */
export async function publishInstagramMedia(args: {
  igUserId: string;
  accessToken: string;
  imageUrl: string;
  caption?: string;
}): Promise<{ mediaId: string }> {
  // Step 1: bikin media container
  const createParams = new URLSearchParams({
    image_url: args.imageUrl,
    access_token: args.accessToken,
  });
  if (args.caption) createParams.set("caption", args.caption);

  const createRes = await fetch(`${GRAPH_BASE}/${args.igUserId}/media`, {
    method: "POST",
    body: createParams,
  });
  const createData = await createRes.json();
  if (!createRes.ok || !createData.id) {
    throw new Error(`IG media container gagal: ${createData.error?.message || createRes.status}`);
  }
  const containerId: string = createData.id;

  // Step 2: publish container
  const publishParams = new URLSearchParams({
    creation_id: containerId,
    access_token: args.accessToken,
  });
  const publishRes = await fetch(`${GRAPH_BASE}/${args.igUserId}/media_publish`, {
    method: "POST",
    body: publishParams,
  });
  const publishData = await publishRes.json();
  if (!publishRes.ok || !publishData.id) {
    throw new Error(`IG media publish gagal: ${publishData.error?.message || publishRes.status}`);
  }
  return { mediaId: publishData.id };
}

/**
 * Reply DM Instagram ke user. Pakai Conversations API endpoint.
 * Memerlukan scope `instagram_business_manage_messages`.
 */
export async function replyInstagramDM(args: {
  igUserId: string;
  accessToken: string;
  recipientId: string;
  message: string;
}): Promise<{ messageId: string }> {
  const url = `${GRAPH_BASE}/${args.igUserId}/messages`;
  const body = {
    recipient: { id: args.recipientId },
    message: { text: args.message },
    access_token: args.accessToken,
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data.message_id) {
    throw new Error(`IG DM reply gagal: ${data.error?.message || res.status}`);
  }
  return { messageId: data.message_id };
}

/**
 * Publish post ke Facebook Page.
 */
export async function publishFacebookPost(args: {
  pageId: string;
  pageAccessToken: string;
  message: string;
  imageUrl?: string;
}): Promise<{ postId: string }> {
  const endpoint = args.imageUrl
    ? `${GRAPH_BASE}/${args.pageId}/photos`
    : `${GRAPH_BASE}/${args.pageId}/feed`;
  const params = new URLSearchParams({
    access_token: args.pageAccessToken,
    message: args.message,
  });
  if (args.imageUrl) params.set("url", args.imageUrl);

  const res = await fetch(endpoint, { method: "POST", body: params });
  const data = await res.json();
  if (!res.ok || (!data.id && !data.post_id)) {
    throw new Error(`FB post gagal: ${data.error?.message || res.status}`);
  }
  return { postId: data.id || data.post_id };
}

// ---------- Threads (graph.threads.net) ----------

/**
 * Tukar Threads code ke short-lived access token.
 */
export async function exchangeThreadsCode(args: {
  code: string;
  redirectUri: string;
  appId: string;
  appSecret: string;
}): Promise<{ accessToken: string; userId: string }> {
  const body = new URLSearchParams({
    client_id: args.appId,
    client_secret: args.appSecret,
    grant_type: "authorization_code",
    redirect_uri: args.redirectUri,
    code: args.code,
  });
  const res = await fetch(`${THREADS_GRAPH}/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Threads token gagal: ${data.error?.message || data.error_message || res.status}`);
  }
  return { accessToken: data.access_token, userId: String(data.user_id) };
}

/**
 * Tukar Threads short-lived ke long-lived (60 hari).
 */
export async function getThreadsLongLivedToken(args: {
  shortToken: string;
  appSecret: string;
}): Promise<{ accessToken: string; expiresIn: number }> {
  const params = new URLSearchParams({
    grant_type: "th_exchange_token",
    client_secret: args.appSecret,
    access_token: args.shortToken,
  });
  const res = await fetch(`${THREADS_GRAPH}/access_token?${params.toString()}`);
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Threads long-lived gagal: ${data.error?.message || res.status}`);
  }
  return { accessToken: data.access_token, expiresIn: data.expires_in || 0 };
}

/**
 * Ambil profile Threads user (handle, name).
 */
export async function getThreadsUser(args: {
  accessToken: string;
  userId: string;
}): Promise<{ id: string; username: string; name?: string }> {
  const fields = "id,username,name,threads_profile_picture_url";
  const url = `${THREADS_GRAPH}/${args.userId}?fields=${fields}&access_token=${encodeURIComponent(args.accessToken)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Threads /me gagal: ${data.error?.message || res.status}`);
  }
  return { id: String(data.id), username: data.username, name: data.name };
}

/**
 * Publish thread (post) ke Threads via 2-step container flow.
 */
export async function publishThread(args: {
  threadsUserId: string;
  accessToken: string;
  text: string;
  mediaUrl?: string;
}): Promise<{ mediaId: string }> {
  // Step 1: container
  const createParams = new URLSearchParams({
    media_type: args.mediaUrl ? "IMAGE" : "TEXT",
    text: args.text,
    access_token: args.accessToken,
  });
  if (args.mediaUrl) createParams.set("image_url", args.mediaUrl);

  const createRes = await fetch(`${THREADS_GRAPH}/${args.threadsUserId}/threads`, {
    method: "POST",
    body: createParams,
  });
  const createData = await createRes.json();
  if (!createRes.ok || !createData.id) {
    throw new Error(`Threads container gagal: ${createData.error?.message || createRes.status}`);
  }
  const containerId: string = createData.id;

  // Step 2: publish (kasih jeda 1-2 detik kalau pakai media — Meta requirement)
  if (args.mediaUrl) {
    await new Promise((r) => setTimeout(r, 2000));
  }
  const publishParams = new URLSearchParams({
    creation_id: containerId,
    access_token: args.accessToken,
  });
  const publishRes = await fetch(`${THREADS_GRAPH}/${args.threadsUserId}/threads_publish`, {
    method: "POST",
    body: publishParams,
  });
  const publishData = await publishRes.json();
  if (!publishRes.ok || !publishData.id) {
    throw new Error(`Threads publish gagal: ${publishData.error?.message || publishRes.status}`);
  }
  return { mediaId: publishData.id };
}
