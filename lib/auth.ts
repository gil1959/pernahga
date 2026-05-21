import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function getGoogleConfig() {
  try {
    const settings = await prisma.siteSettings.findMany({
      where: { key: { in: ["googleOAuthEnabled", "googleClientId", "googleClientSecret"] } },
    });
    const map: Record<string, string> = {};
    settings.forEach((s) => { map[s.key] = s.value; });
    return map;
  } catch {
    return {};
  }
}

export const nextAuthConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    // GoogleProvider injected dynamically in route.ts
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const cfg = await getGoogleConfig();
        if (cfg.googleOAuthEnabled !== "true") return false;
        // Auto-create or link user. phoneVerified intentionally null:
        // middleware will redirect such users to /verify-phone.
        if (user.email) {
          const existingUser = await prisma.user.findUnique({ where: { email: user.email } });
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || user.email,
                image: user.image,
                emailVerified: new Date(),
                role: "USER",
              },
            });
          } else if (!existingUser.image && user.image) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { image: user.image, emailVerified: new Date() },
            });
          }
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      // First sign-in: hydrate token from DB.
      if (user) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
        token.role = dbUser?.role ?? "USER";
        token.id = dbUser?.id ?? (user.id as string);
        token.phoneVerified = dbUser?.phoneVerified ? true : false;
        token.phone = dbUser?.phone ?? null;
      }
      // On manual session.update() refresh phone fields.
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
        if (dbUser) {
          token.phoneVerified = dbUser.phoneVerified ? true : false;
          token.phone = dbUser.phone ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.phoneVerified = Boolean(token.phoneVerified);
        session.user.phone = (token.phone as string | null) ?? null;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(nextAuthConfig);
