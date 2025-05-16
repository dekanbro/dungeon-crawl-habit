"use client";

import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import SubmissionPreviewModal from "./SubmissionPreviewModal";
import type { UserUpdate } from "@/lib/types";

type BossStatus = "defeated" | "weakened" | "untouched" | null;

interface DungeonTileProps {
  date: Date;
  streakValue: number | null;
  update?: UserUpdate;
  isBossDay: boolean;
  bossStatus: BossStatus;
}

export default function DungeonTile({ 
  date, 
  streakValue, 
  update, 
  isBossDay,
  bossStatus 
}: DungeonTileProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Style based on streak value
  const getTileStyle = () => {
    if (isBossDay) {
      return getBossTileStyle();
    }
    
    if (streakValue === null) {
      return "bg-stone-800 border-stone-700"; // Inactive tile
    }
    
    if (streakValue === 0) {
      return "bg-stone-800 border-stone-700 after:content-[''] after:absolute after:inset-0 after:bg-[url('/cobweb.svg')] after:opacity-40"; // Broken streak
    }
    
    if (streakValue === 1) {
      return "bg-stone-700 border-amber-900/50 shadow-[inset_0_0_6px_rgba(251,191,36,0.2)]"; // Faint torch glow
    }
    
    if (streakValue >= 2 && streakValue <= 3) {
      return "bg-stone-700 border-amber-600/50 shadow-[inset_0_0_8px_rgba(251,191,36,0.4)] after:content-[''] after:absolute after:inset-0 after:bg-[url('/glyph.svg')] after:opacity-40"; // Glowing glyphs
    }
    
    // 4+ day streak
    return "bg-stone-600 border-amber-500/70 shadow-[inset_0_0_12px_rgba(251,191,36,0.6)] after:content-[''] after:absolute after:inset-1 after:bg-[url('/runes.svg')] after:opacity-60"; // Glowing runes/lava
  };
  
  const getBossTileStyle = () => {
    if (bossStatus === "defeated") {
      return "bg-stone-600 border-emerald-500 shadow-[inset_0_0_14px_rgba(16,185,129,0.6)] after:content-[''] after:absolute after:inset-0 after:bg-[url('/dragon-defeated.svg')] after:bg-center after:bg-no-repeat after:bg-contain";
    }
    
    if (bossStatus === "weakened") {
      return "bg-stone-700 border-amber-500 shadow-[inset_0_0_10px_rgba(245,158,11,0.4)] after:content-[''] after:absolute after:inset-0 after:bg-[url('/dragon-weakened.svg')] after:bg-center after:bg-no-repeat after:bg-contain";
    }
    
    return "bg-stone-800 border-red-900/50 shadow-[inset_0_0_6px_rgba(220,38,38,0.3)] after:content-[''] after:absolute after:inset-0 after:bg-[url('/dragon.svg')] after:bg-center after:bg-no-repeat after:bg-contain"; // Untouched
  };
  
  const getTileContent = () => {
    if (isBossDay) {
      return <span className="sr-only">Boss Tile</span>;
    }
    
    if (streakValue === null) {
      return <span className="sr-only">No activity</span>;
    }
    
    return <span className="sr-only">{streakValue} day streak</span>;
  };

  // Truncate text for tooltip preview
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "w-24 sm:w-28 aspect-square relative border rounded-sm transition-all duration-300",
                getTileStyle(),
                update && "cursor-pointer hover:scale-105"
              )}
              aria-label={`Activity for ${format(date, "MMMM d, yyyy")}`}
              onClick={() => update && setIsPreviewOpen(true)}
            >
              {getTileContent()}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs bg-popover border border-popover p-3 rounded-md shadow-lg">
            <div className="space-y-1">
              <p className="font-medium">{format(date, "MMMM d, yyyy")}</p>
              {update ? (
                <>
                  <p className="text-sm">{truncateText(update.submissionText)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click to view full entry
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No entry for this day</p>
              )}
              {streakValue !== null && streakValue > 0 && (
                <p className="text-xs text-amber-500 font-medium mt-1">
                  {streakValue} day streak
                </p>
              )}
              {isBossDay && (
                <p className="text-xs mt-1 font-medium">
                  {bossStatus === "defeated" && "Weekly boss defeated!"}
                  {bossStatus === "weakened" && "Boss weakened but not defeated."}
                  {bossStatus === "untouched" && "Boss awaits challengers."}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <SubmissionPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        submission={update ? {
          text: update.submissionText,
          date: update.date
        } : null}
      />
    </>
  );
}