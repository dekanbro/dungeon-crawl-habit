import DungeonHabitTracker from "@/components/DungeonHabitTracker";
import { ThemeProvider } from "@/components/ThemeProvider";
import UserProfile from "@/components/UserProfile";
import { getServerSession } from "next-auth/next";

export default async function Home() {
  const session = await getServerSession();

  return (
    <ThemeProvider>
      <main className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-5xl flex justify-end mb-4">
          <UserProfile />
        </div>
        <h1 className="text-3xl md:text-4xl font-serif text-primary mb-6 mt-4 text-center">
          Dungeon Crawl Habit Tracker
        </h1>
        <p className="text-muted-foreground mb-8 max-w-2xl text-center">
          Track your daily habits with this dungeon-themed heatmap. Complete streaks to reveal ancient runes and defeat weekly bosses!
        </p>
        {session ? (
          <DungeonHabitTracker userId={session.user?.email || ""} />
        ) : (
          <div className="text-center text-muted-foreground">
            Sign in to start tracking your habits
          </div>
        )}
      </main>
    </ThemeProvider>
  );
}