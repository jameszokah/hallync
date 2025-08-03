import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { UserRole } from "@/app/generated/prisma";
import { getUser, getUserByEmail } from "./lib/actions/auth";
import authConfig from "./auth.config";
import { DefaultSession } from "next-auth";
import { User as DefaultUser } from "@/app/generated/prisma";
// import { JWT } from "next-auth/jwt";
// import { GoogleProvider } from "next-auth/providers";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "STUDENT" | "OWNER" | "ADMIN" | null;
      first_name?: string | null;
      last_name?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: UserRole;
    first_name?: string | null;
    last_name?: string | null;
  }
}

declare module "next-auth" {
  interface JWT {
    role?: UserRole | null;
    first_name?: string | null;
    last_name?: string | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        (session.user as any).role = token.role;
        session.user.first_name = token.first_name as string | null;
        session.user.last_name = token.last_name as string | null;
        session.user.name = token.name;
      }
      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await prisma.user.findUnique({
        where: { id: token.sub },
      });

      if (!existingUser) return token;

      token.role = existingUser.role;
      token.name = existingUser.name;
      token.first_name = existingUser.first_name;
      token.last_name = existingUser.last_name;
      token.needsOnboarding = existingUser?.role === null;
      return token;
    },
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        // For new Google auth users, ensure role is null and set name fields
        if (dbUser) {
          const updateData: any = {};

          // Set role to null for new social auth users if not already set
          if (dbUser.role === null || dbUser.role === undefined) {
            updateData.role = null;
          }

          // Set first_name and last_name from Google profile if not already set
          if (!dbUser.first_name && user.name) {
            const nameParts = user.name.split(" ");
            updateData.first_name = nameParts[0];
            updateData.last_name = nameParts.slice(1).join(" ") || null;
          }

          if (Object.keys(updateData).length > 0) {
            const updatedUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: updateData,
            });
            // Update the user object for the JWT callback
            user.first_name = updatedUser.first_name;
            user.last_name = updatedUser.last_name;
            user.role = updatedUser.role || undefined;
          }
        }
      }
      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
  ...authConfig,
});
