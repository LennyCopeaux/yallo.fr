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
        if (!credentials?.email || !credentials?.password) return null;

        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1);

        if (!existingUser) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          existingUser.passwordHash
        );
        if (!isPasswordValid) return null;

        return {
          id: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
          mustChangePassword: existingUser.mustChangePassword,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      const allowedOrigins = [
        "https://app.staging.yallo.fr",
        "https://staging.yallo.fr",
        "https://app.yallo.fr",
        "https://yallo.fr",
        "http://app.localhost",
        "http://localhost",
      ];

      const isAllowedOrigin = allowedOrigins.some((origin) => url.startsWith(origin));
      if (isAllowedOrigin) return url;

      if (url.startsWith("/")) return `${baseUrl}${url}`;

      return baseUrl;
    },
  },
} satisfies NextAuthConfig;
