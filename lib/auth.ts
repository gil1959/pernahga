import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
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

export const { handlers, auth, signIn, signOut } = NextAuth({
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Google OAuth: check if enabled in settings
      if (account?.provider === "google") {
        const cfg = await getGoogleConfig();
        if (cfg.googleOAuthEnabled !== "true") return false;
        // Auto-create or link user in DB
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
    async jwt({ token, user }) {
      if (user) {
        // Fetch fresh role from DB
        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
        token.role = dbUser?.role ?? "USER";
        token.id = dbUser?.id ?? (user.id as string);
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
