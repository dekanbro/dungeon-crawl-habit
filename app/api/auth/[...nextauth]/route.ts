import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Discord from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import { createOrUpdateUser } from "@/lib/airtable";

const handler = NextAuth({
  providers: [
    // Development credentials provider
    ...(process.env.NODE_ENV === "development" ? [
      CredentialsProvider({
        name: "Development",
        credentials: {},
        async authorize() {
          // Return a default user for development
          return {
            id: "dev-user",
            name: "Development User",
            email: "dev@example.com",
            image: "https://github.com/identicon.png"
          };
        }
      })
    ] : []),
    // Production providers
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
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
        console.log('[Auth] Sign in attempt:', {
          email: user.email,
          name: user.name,
          provider: account?.provider || 'credentials',
          accountId: account?.providerAccountId,
        });

        // Create or update user in Airtable
        const userData = {
          email: user.email!,
          name: user.name || undefined,
          avatarUrl: user.image || undefined,
          createdAt: new Date().toISOString(),
          // Add provider-specific IDs and usernames
          ...(account?.provider === 'github' && { githubId: account.providerAccountId }),
          ...(account?.provider === 'discord' && { 
            discordId: account.providerAccountId,
            discordUsername: user.name ?? undefined
          }),
          linkedProviders: account?.provider ? [account.provider] : []
        };

        console.log('[Auth] Attempting to create/update user in Airtable:', userData);
        
        const result = await createOrUpdateUser(userData);
        console.log('[Auth] Successfully created/updated user in Airtable:', {
          id: result.id,
          email: result.email,
          linkedProviders: result.linkedProviders
        });
        
        return true;
      } catch (error) {
        console.error("[Auth] Error in signIn callback:", {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          user: {
            email: user.email,
            name: user.name,
            provider: account?.provider || 'credentials'
          }
        });
        return true; // Still allow sign in even if Airtable update fails
      }
    }
  },
});

export { handler as GET, handler as POST };