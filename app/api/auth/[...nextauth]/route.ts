import { NextRequest } from "next/server";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { nextAuthConfig } from "@/lib/auth";

async function getDynamicConfig() {
  const settings = await prisma.siteSettings.findMany({
    where: { key: { in: ["googleOAuthEnabled", "googleClientId", "googleClientSecret"] } },
  });
  const map: Record<string, string> = {};
  settings.forEach((s) => { map[s.key] = s.value; });

  return {
    ...nextAuthConfig,
    providers: [
      ...(nextAuthConfig.providers as any[]),
      GoogleProvider({
        clientId: map.googleClientId || process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: map.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET || "",
        allowDangerousEmailAccountLinking: true,
      }),
    ],
  };
}

export const GET = async (req: NextRequest) => {
  const config = await getDynamicConfig();
  const { handlers } = NextAuth(config as any);
  return handlers.GET(req);
};

export const POST = async (req: NextRequest) => {
  const config = await getDynamicConfig();
  const { handlers } = NextAuth(config as any);
  return handlers.POST(req);
};
