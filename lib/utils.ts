import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBossStatus(completedDaysInWeek: number): "defeated" | "weakened" | "untouched" {
  if (completedDaysInWeek >= 6) {
    return "defeated";  // Boss defeated (completed 6-7 days)
  } else if (completedDaysInWeek >= 3) {
    return "weakened";  // Boss weakened (completed 3-5 days)
  } else {
    return "untouched"; // Boss untouched (completed 0-2 days)
  }
}

// Helper functions for generating mock data
export function generateMockHeatmap(weeks: number = 4): (number | null)[][] {
  const heatmap: (number | null)[][] = [];
  
  for (let w = 0; w < weeks; w++) {
    const week: (number | null)[] = [];
    for (let d = 0; d < 7; d++) {
      // Random streak value between 0-5, or null for no data
      const value = Math.random() > 0.3 
        ? Math.floor(Math.random() * 6) 
        : null;
      week.push(value);
    }
    heatmap.push(week);
  }
  
  return heatmap;
}

export function generateMockUpdates(count: number = 20): any[] {
  const updates = [];
  const today = new Date();
  
  const submissions = [
    "Completed my morning workout routine.",
    "Read 30 pages of my current book.",
    "Practiced meditation for 15 minutes.",
    "Wrote in my journal for 20 minutes.",
    "Drank 8 glasses of water today.",
    "Went for a 30-minute walk.",
    "Practiced coding for 1 hour.",
    "Ate 3 healthy meals without snacking.",
    "Completed daily language learning exercises.",
    "Decluttered one area of my home."
  ];
  
  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    updates.push({
      id: `update-${i}`,
      userId: "user123",
      date: date.toISOString().split('T')[0],
      submissionText: submissions[Math.floor(Math.random() * submissions.length)],
      streakCount: Math.floor(Math.random() * 10) + 1
    });
  }
  
  return updates;
}