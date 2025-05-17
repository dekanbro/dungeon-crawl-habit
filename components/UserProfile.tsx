"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Github, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function UserProfile() {
  const { data: session, status } = useSession();
  const [isLinking, setIsLinking] = useState(false);

  if (status === "loading") {
    return (
      <div className="animate-pulse flex items-center gap-2">
        <div className="w-8 h-8 bg-secondary rounded-full"></div>
        <div className="h-4 w-24 bg-secondary rounded"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex gap-2">
        <Button onClick={() => signIn("github")} variant="secondary" className="gap-2">
          <Github size={16} />
          GitHub
        </Button>
        <Button onClick={() => signIn("discord")} variant="secondary" className="gap-2">
          <MessageSquare size={16} />
          Discord
        </Button>
      </div>
    );
  }

  const handleLinkAccount = async (provider: string) => {
    setIsLinking(true);
    try {
      await signIn(provider, { callbackUrl: window.location.href });
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
          <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-muted-foreground">{session.user?.name}</p>
          <p className="text-xs text-muted-foreground">{session.user?.email}</p>
          <p className="text-xs text-muted-foreground">Signed in with {session.user?.provider}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {session.user?.provider === "github" && (
          <Button 
            onClick={() => handleLinkAccount("discord")} 
            variant="outline" 
            size="sm"
            disabled={isLinking}
            className="gap-2"
          >
            <MessageSquare size={16} />
            Link Discord
          </Button>
        )}
        {session.user?.provider === "discord" && (
          <Button 
            onClick={() => handleLinkAccount("github")} 
            variant="outline" 
            size="sm"
            disabled={isLinking}
            className="gap-2"
          >
            <Github size={16} />
            Link GitHub
          </Button>
        )}
        <Button onClick={() => signOut()} variant="ghost" size="icon">
          <LogOut size={16} className="text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}