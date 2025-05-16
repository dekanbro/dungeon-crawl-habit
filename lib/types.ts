// Data model types

export interface UserStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  heatmap: (number | null)[][];
}

export interface UserUpdate {
  id: string;
  userId: string;
  date: string; // ISO format date string
  submissionText: string;
  streakCount: number;
}

export interface SubmissionPayload {
  userId: string;
  date: string;
  submissionText: string;
}

export interface WebhookPayload {
  userId: string;
  date: string;
  submissionText: string;
  streakCount: number;
}