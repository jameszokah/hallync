import type { NextAuthConfig } from "next-auth";
import { getUserByEmail } from "./lib/actions/auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }
        const user = await getUserByEmail(credentials?.email as string);
        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        } 

        const passwordsMatch = await bcrypt.compare(
          credentials?.password as string,
          user.password as string,
        );
        if (!passwordsMatch) {
          throw new Error("Invalid email or password");
        }
        console.log(user, 'user')
        console.log(credentials, 'credentials')
        return user;
      },
    }),
    GoogleProvider({
      clientId: process?.env?.AUTH_GOOGLE_CLIENT_ID as string,
      clientSecret: process?.env?.AUTH_GOOGLE_CLIENT_SECRET as string,
    }),
    ],
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    signOut: "/",
    // error: "/auth/login",
    // verifyRequest: "/auth/login",
    newUser: "/auth/login",
  },
} satisfies NextAuthConfig;
