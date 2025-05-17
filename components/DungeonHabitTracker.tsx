"use client";

import { useEffect, useState } from "react";
import { format, parseISO, startOfWeek, addDays, subWeeks, addWeeks, differenceInCalendarDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DungeonGrid from "./DungeonGrid";
import SubmissionForm from "./SubmissionForm";
import ThemeSelector from "./ThemeSelector";
import TrackerLegend from "./TrackerLegend";
import { useToast } from "@/hooks/use-toast";
import { fetchUserStreaks, fetchUserUpdates, submitUpdate } from "@/lib/api";
import type { UserStreak, UserUpdate } from "@/lib/types";

interface DungeonHabitTrackerProps {
  userId: string;
}

export default function DungeonHabitTracker({ userId }: DungeonHabitTrackerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [streaks, setStreaks] = useState<UserStreak | null>(null);
  const [updates, setUpdates] = useState<UserUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const { toast } = useToast();

  // Get today's update if it exists
  const todayUpdate = updates.find(update => 
    update.date === currentDate.toISOString().split('T')[0]
  );

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const streakData = await fetchUserStreaks(userId);
        const updateData = await fetchUserUpdates(userId);
        setStreaks(streakData);
        setUpdates(updateData);
      } catch (error) {
        toast({
          title: "Failed to load data",
          description: "Could not retrieve your habit data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [userId, toast]);

  const navigateWeeks = (direction: "prev" | "next") => {
    setCurrentWeekStart(direction === "prev" 
      ? subWeeks(currentWeekStart, 4) 
      : addWeeks(currentWeekStart, 4));
  };

  const handleSubmitUpdate = async (text: string) => {
    console.log("handleSubmitUpdate called with text:", text);
    try {
      await submitUpdate(userId, currentDate.toISOString().split("T")[0], text);

      // Refresh data after submission
      const streakData = await fetchUserStreaks(userId);
      const updateData = await fetchUserUpdates(userId);
      setStreaks(streakData);
      setUpdates(updateData);
      
      toast({
        title: "Progress Updated!",
        description: "Your dungeon scroll has been updated successfully.",
      });
      console.log("Toast should have fired!");
    } catch (error) {
      toast({
        title: "Failed to update",
        description: "Could not record your progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  console.log("currentWeekStart (local):", currentWeekStart);
  console.log("updates:", updates.map(u => u.date));
  console.log("heatmapData:", streaks?.heatmap);

  return (
    <div className="w-full max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-serif text-primary">Your Dungeon Progress</h2>
        <ThemeSelector />
      </div>
      
      <div className="bg-card border border-border rounded-lg p-4 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => navigateWeeks("prev")} 
            className="p-2 bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
            aria-label="Previous weeks"
          >
            <ChevronLeft size={18} />
          </button>
          
          <div className="text-lg font-medium text-muted-foreground">
            {format(currentWeekStart, "MMM d")} - {format(addDays(currentWeekStart, 27), "MMM d, yyyy")}
          </div>
          
          <button 
            onClick={() => navigateWeeks("next")} 
            className="p-2 bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
            aria-label="Next weeks"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading dungeon map...</div>
          </div>
        ) : (
          <DungeonGrid 
            weekStart={currentWeekStart} 
            heatmapData={streaks?.heatmap || []} 
            updates={updates}
          />
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2 bg-card border border-border rounded-lg p-4 shadow-md">
          <h3 className="text-xl font-serif text-primary mb-3">Submit Today&apos;s Update</h3>
          <SubmissionForm 
            onSubmit={handleSubmitUpdate} 
            todayUpdate={todayUpdate ? {
              text: todayUpdate.submissionText,
              date: todayUpdate.date
            } : undefined}
          />
        </div>
        
        <div className="w-full md:w-1/2 bg-card border border-border rounded-lg p-4 shadow-md">
          <h3 className="text-xl font-serif text-primary mb-3">Stats</h3>
          {streaks && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Streak:</span>
                <span className="font-medium text-primary">{streaks.currentStreak} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Longest Streak:</span>
                <span className="font-medium text-primary">{streaks.longestStreak} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Updates:</span>
                <span className="font-medium text-primary">{updates.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <TrackerLegend />
    </div>
  );
}