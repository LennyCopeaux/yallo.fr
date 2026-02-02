import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Recherche l'utilisateur par email
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) {
          return null;
        }

        // Vérifie le mot de passe
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatch) {
          return null;
        }

        // Retourne tous les champs nécessaires, y compris mustChangePassword
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Permet les redirections vers staging
      if (url.startsWith("https://app.staging.yallo.fr") || url.startsWith("https://staging.yallo.fr")) {
        return url;
      }
      
      // Permet les redirections vers production
      if (url.startsWith("https://app.yallo.fr") || url.startsWith("https://yallo.fr")) {
        return url;
      }
      
      // Permet les redirections locales
      if (url.startsWith("http://app.localhost") || url.startsWith("http://localhost")) {
        return url;
      }
      
      // Permet les URLs relatives
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      
      // Par défaut, retourne la base URL
      return baseUrl;
    },
  },
} satisfies NextAuthConfig;
