import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import type { UserRole } from "@/db/schema";

declare module "next-auth" {
  interface User {
    role?: UserRole;
    mustChangePassword?: boolean;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      role: UserRole;
      mustChangePassword: boolean;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.mustChangePassword = user.mustChangePassword ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = (token.role as UserRole) ?? "OWNER";
        session.user.mustChangePassword = Boolean(token.mustChangePassword ?? false);
      }
      return session;
    },
  },
});
