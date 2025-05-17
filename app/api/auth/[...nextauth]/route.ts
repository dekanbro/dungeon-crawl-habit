import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import DiscordProvider from "next-auth/providers/discord";
import { createOrUpdateUser } from "@/lib/airtable";

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_ID || "",
      clientSecret: process.env.DISCORD_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub || "";
        // Add provider info to session
        session.user.provider = token.provider as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      try {
        // Create or update user in Airtable
        await createOrUpdateUser({
          email: user.email!,
          name: user.name || undefined,
          avatarUrl: user.image || undefined,
          createdAt: new Date().toISOString(),
          // Add provider-specific IDs
          ...(account?.provider === 'github' && { githubId: account.providerAccountId }),
          ...(account?.provider === 'discord' && { discordId: account.providerAccountId }),
          linkedProviders: account?.provider ? [account.provider] : []
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