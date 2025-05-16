import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { createOrUpdateUser } from "@/lib/airtable";

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub || "";
      }
      return session;
    },
    async signIn({ user }) {
      try {
        // Create or update user in Airtable
        await createOrUpdateUser({
          email: user.email!,
          name: user.name || undefined,
          avatarUrl: user.image || undefined,
          createdAt: new Date().toISOString()
        });
        return true;
      } catch (error) {
        console.error("Error creating/updating user in Airtable:", error);
        return true; // Still allow sign in even if Airtable update fails
      }
    }
  },
});

export { handler as GET, handler as POST };