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
        // Validation stricte : le rôle doit être présent dans le token
        if (!token.role || (token.role !== "ADMIN" && token.role !== "OWNER")) {
          console.error(
            "[AUTH ERROR] Session invalide : rôle manquant ou invalide",
            { userId: token.id, email: session.user.email, tokenRole: token.role }
          );
          // Invalider la session en ne retournant pas les données utilisateur
          return session;
        }

        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.mustChangePassword = Boolean(token.mustChangePassword ?? false);
      }
      return session;
    },
  },
});
