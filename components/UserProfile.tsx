"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Github } from "lucide-react";

export default function UserProfile() {
  const { data: session, status } = useSession();

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
      <Button onClick={() => signIn("github")} variant="outline" className="gap-2">
        <Github size={16} />
        Sign in with GitHub
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
          <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="hidden sm:block">
          <p className="text-sm font-medium">{session.user?.name}</p>
          <p className="text-xs text-muted-foreground">{session.user?.email}</p>
        </div>
      </div>
      <Button onClick={() => signOut()} variant="ghost" size="icon">
        <LogOut size={16} />
      </Button>
    </div>
  );
}