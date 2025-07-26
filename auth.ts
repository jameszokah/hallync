import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { UserRole } from "@/app/generated/prisma";
import { getUser, getUserByEmail } from "./lib/actions/auth";
import authConfig from "./auth.config";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: UserRole | null;
      first_name?: string | null;
      last_name?: string | null;
    };
  }

  interface User {
    role?: UserRole;
    first_name?: string | null;
    last_name?: string | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        // Add user data from token to the session
        session.user.role = (token?.role as UserRole) || "STUDENT"; // Default to STUDENT if no role
        session.user.id = token?.sub as string;
        session.user.first_name = token?.first_name as string;
        session.user.last_name = token?.last_name as string;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        try {
          // Fetch full user data from database to get the role
          const dbUser = await getUserByEmail(user.email as string);

          if (dbUser) {
            token.role = dbUser.role || "STUDENT"; // Default to STUDENT if no role in DB
            token.first_name = dbUser.first_name;
            token.last_name = dbUser.last_name;
          } else {
            // If no user found in DB (should be rare), default to STUDENT
            token.role = "STUDENT";
          }
        } catch (error) {
          console.error("Error fetching user data in JWT callback:", error);
          // Default to STUDENT if there's an error
          token.role = "STUDENT";
        }
      }

      // Update the token if user data changed (e.g., role updated)
      if (trigger === "update" && session?.user) {
        if (session.user.role) {
          token.role = session.user.role;
        }
        if (session.user.first_name) {
          token.first_name = session.user.first_name;
        }
        if (session.user.last_name) {
          token.last_name = session.user.last_name;
        }
      }

      return token;
    },
    async signIn({ user }) {
      // Set default values for first_name and last_name if not present
      if (!user?.first_name && !user?.last_name && user?.name) {
        const nameParts = user.name.split(" ");
        user.first_name = nameParts[0] || "Guest";
        user.last_name = nameParts.length > 1 ? nameParts[1] : "User";
      }
      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
  ...authConfig,
});
