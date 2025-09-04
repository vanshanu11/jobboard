import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GitHub({ clientId: process.env.GITHUB_ID||"", clientSecret: process.env.GITHUB_SECRET||"", allowDangerousEmailAccountLinking: true }),
    Credentials({
      name: "Credentials",
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.passwordHash) return null;
        const ok = await compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      if (user) token.userId = (user as any).id;
      return token;
    },
    async session({ session, token }) {
      if (token.role) (session as any).role = token.role;
      if (token.userId) (session as any).userId = token.userId;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
