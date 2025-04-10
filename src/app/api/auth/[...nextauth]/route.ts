import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { db } from "@/lib/db";

// Define providers based on environment
const providers = [];

// Only add Google provider if we have real credentials
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID !== "test-google-client-id" &&
  process.env.GOOGLE_CLIENT_SECRET !== "test-google-client-secret"
) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Always add credentials provider
providers.push(
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const user = await db.user.findUnique({
        where: {
          email: credentials.email,
        },
      });

      if (!user || !user.password) {
        return null;
      }

      const isPasswordValid = await compare(credentials.password, user.password);

      if (!isPasswordValid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  })
);

const handler = NextAuth({
  adapter: PrismaAdapter(db),
  providers,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirect to login page on error
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST }; 