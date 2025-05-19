"use client";

import { useState } from "react";
import { format, addDays, isSameDay, parseISO, addWeeks } from "date-fns";
import DungeonTile from "./DungeonTile";
import { getBossStatus } from "@/lib/utils";
import type { UserUpdate } from "@/lib/types";

interface DungeonGridProps {
  weekStart: Date;
  heatmapData: (number | null)[][];
  updates: UserUpdate[];
}

export default function DungeonGrid({ weekStart, heatmapData, updates }: DungeonGridProps) {
  // Generate day and week labels
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  // Generate weeks so that weeks[0] is apiWeekStart (top), weeks[3] is apiWeekStart + 3 weeks (bottom)
  const weeks = Array.from({ length: 4 }, (_, i) => {
    const startDate = addWeeks(weekStart, i);
    return {
      label: format(startDate, "MMM d"),
      days: Array.from({ length: 7 }, (_, dayIndex) => addDays(startDate, dayIndex))
    };
  });

  // Find update for a specific date
  const getUpdateForDate = (date: Date): UserUpdate | undefined => {
    const cellDateStr = date.toISOString().split('T')[0];
    const updateDates = updates.map(u => u.date);
    console.log('Checking cell date:', cellDateStr, 'against update dates:', updateDates);
    return updates.find(update => {
      const updateDate = parseISO(update.date);
      if (isSameDay(updateDate, date)) {
        console.log("MATCH", { updateDate, cellDate: date, update });
      }
      return isSameDay(updateDate, date);
    });
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex justify-center w-full">
        <table className="min-w-[400px] sm:min-w-[600px] border-separate border-spacing-1 sm:border-spacing-2">
          <thead>
            <tr>
              <th className="p-1 sm:p-2"></th>
              {dayLabels.map((day) => (
                <th key={day} className="text-center text-xs text-muted-foreground font-medium px-1 sm:px-3 py-1 sm:py-2">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, weekIndex) => (
              <tr key={weekIndex}>
                <td className="text-xs text-muted-foreground font-medium text-right pr-1 sm:pr-3 align-middle whitespace-nowrap py-1 sm:py-2">
                  {week.label}
                </td>
                {week.days.map((date, dayIndex) => {
                  const isBossDay = dayIndex === 6; // Sunday is boss day
                  const streakValue = heatmapData[weekIndex]?.[dayIndex] ?? null;
                  const update = getUpdateForDate(date);
                  const bossStatus = isBossDay ? getBossStatus(
                    heatmapData[weekIndex]?.filter(Boolean).length || 0
                  ) : null;
                  return (
                    <td key={dayIndex} className="p-0 text-center align-middle px-1 sm:px-3 py-1 sm:py-2">
                      <DungeonTile
                        date={date}
                        streakValue={streakValue}
                        update={update}
                        isBossDay={isBossDay}
                        bossStatus={bossStatus}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}