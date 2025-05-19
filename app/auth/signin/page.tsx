"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { FaDiscord } from "react-icons/fa";

export default function SignIn() {
  const isDevelopment = process.env.NODE_ENV === "development";

  const handleSignIn = async (provider: string) => {
    await signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div className="container max-w-md mx-auto py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome to Dungeon Crawl</h1>
        <p className="text-muted-foreground">
          Sign in to start tracking your daily progress
        </p>
      </div>

      <div className="space-y-4">
        {isDevelopment ? (
          <Button
            onClick={() => handleSignIn("credentials")}
            className="w-full"
            size="lg"
          >
            Sign in as Development User
          </Button>
        ) : (
          <>
            <Button
              onClick={() => handleSignIn("github")}
              className="w-full"
              size="lg"
            >
              <Github className="mr-2 h-5 w-5" />
              Continue with GitHub
            </Button>
            <Button
              onClick={() => handleSignIn("discord")}
              className="w-full"
              size="lg"
            >
              <FaDiscord className="mr-2 h-5 w-5" />
              Continue with Discord
            </Button>
          </>
        )}
      </div>
    </div>
  );
} 