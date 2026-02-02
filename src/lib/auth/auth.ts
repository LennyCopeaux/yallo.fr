import NextAuth from "next-auth";
import authConfig from "@/lib/auth/auth.config";
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
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.mustChangePassword = user.mustChangePassword ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user || !token) return session;

      const hasValidRole = token.role === "ADMIN" || token.role === "OWNER";
      if (!hasValidRole) {
        console.error("[AUTH] Invalid session: missing or invalid role", {
          userId: token.id,
          email: session.user.email,
          tokenRole: token.role,
        });
        return session;
      }

      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      session.user.mustChangePassword = Boolean(token.mustChangePassword ?? false);
      return session;
    },
  },
});
