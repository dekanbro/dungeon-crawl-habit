import Airtable from 'airtable';

// Table names
const TABLES = {
  SUBMISSIONS: 'Submissions',
  USERS: 'Users',
  STREAKS: 'Streaks'
} as const;

// Helper function to format date for Airtable
function formatDateForAirtable(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Validate environment variables
if (!process.env.AIRTABLE_API_KEY) {
  throw new Error('AIRTABLE_API_KEY is required in environment variables');
}

if (!process.env.AIRTABLE_BASE_ID) {
  throw new Error('AIRTABLE_BASE_ID is required in environment variables');
}

// Initialize Airtable with error handling
let base: Airtable.Base;
try {
  base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
  }).base(process.env.AIRTABLE_BASE_ID);
} catch (error) {
  console.error('Failed to initialize Airtable:', error);
  throw new Error('Failed to initialize Airtable client. Please check your API key and base ID.');
}

// Types for Airtable records
export interface AirtableSubmission {
  id?: string;
  userId: string;
  date: string;
  submissionText: string;
  streakCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AirtableUser {
  id?: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AirtableStreak {
  id?: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastUpdated: string;
}

// Utility functions for Airtable operations
export async function getSubmissions(userId: string, limit: number = 30): Promise<AirtableSubmission[]> {
  try {
    const records = await base(TABLES.SUBMISSIONS)
      .select({
        filterByFormula: `{userId} = '${userId}'`,
        sort: [{ field: 'date', direction: 'desc' }],
        maxRecords: limit
      })
      .all();

    return records.map(record => ({
      id: record.id,
      ...record.fields
    })) as AirtableSubmission[];
  } catch (error) {
    console.error('Error fetching submissions:', error);
    // Return empty array if there's an error
    return [];
  }
}

export async function createSubmission(submission: Omit<AirtableSubmission, 'id'>): Promise<AirtableSubmission> {
  try {
    const record = await base(TABLES.SUBMISSIONS).create({
      ...submission,
      createdAt: formatDateForAirtable(new Date(submission.createdAt)),
      updatedAt: formatDateForAirtable(new Date(submission.updatedAt))
    });
    return {
      id: record.id,
      ...record.fields
    } as AirtableSubmission;
  } catch (error) {
    console.error('Error creating submission:', error);
    throw error;
  }
}

export async function updateSubmission(id: string, submission: Partial<AirtableSubmission>): Promise<AirtableSubmission> {
  try {
    const record = await base(TABLES.SUBMISSIONS).update(id, {
      ...submission,
      updatedAt: submission.updatedAt ? formatDateForAirtable(new Date(submission.updatedAt)) : undefined
    });
    return {
      id: record.id,
      ...record.fields
    } as AirtableSubmission;
  } catch (error) {
    console.error('Error updating submission:', error);
    throw error;
  }
}

export async function getUserStreak(userId: string): Promise<AirtableStreak> {
  try {
    const records = await base(TABLES.STREAKS)
      .select({
        filterByFormula: `{userId} = '${userId}'`,
        maxRecords: 1
      })
      .all();

    if (records.length === 0) {
      // Create new streak record if none exists
      const newStreak: Omit<AirtableStreak, 'id'> = {
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastUpdated: formatDateForAirtable(new Date())
      };
      
      try {
        const record = await base(TABLES.STREAKS).create(newStreak);
        return {
          id: record.id,
          ...record.fields
        } as AirtableStreak;
      } catch (createError) {
        console.error('Error creating new streak record:', createError);
        // If creation fails, return a default streak object
        return {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          lastUpdated: formatDateForAirtable(new Date())
        };
      }
    }

    return {
      id: records[0].id,
      ...records[0].fields
    } as AirtableStreak;
  } catch (error) {
    console.error('Error fetching user streak:', error);
    // Return a default streak object if there's an error
    return {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastUpdated: formatDateForAirtable(new Date())
    };
  }
}

export async function updateUserStreak(id: string, streak: Partial<AirtableStreak>): Promise<AirtableStreak> {
  try {
    const record = await base(TABLES.STREAKS).update(id, {
      ...streak,
      lastUpdated: streak.lastUpdated ? formatDateForAirtable(new Date(streak.lastUpdated)) : undefined
    });
    return {
      id: record.id,
      ...record.fields
    } as AirtableStreak;
  } catch (error) {
    console.error('Error updating user streak:', error);
    throw error;
  }
}

export async function createOrUpdateUser(user: Omit<AirtableUser, 'id'>): Promise<AirtableUser> {
  try {
    const records = await base(TABLES.USERS)
      .select({
        filterByFormula: `{email} = '${user.email}'`,
        maxRecords: 1
      })
      .all();

    if (records.length === 0) {
      // Create new user
      const record = await base(TABLES.USERS).create({
        ...user,
        createdAt: formatDateForAirtable(new Date(user.createdAt))
      });
      return {
        id: record.id,
        ...record.fields
      } as AirtableUser;
    }

    // Update existing user
    const record = await base(TABLES.USERS).update(records[0].id, {
      ...user,
      createdAt: formatDateForAirtable(new Date(user.createdAt))
    });
    return {
      id: record.id,
      ...record.fields
    } as AirtableUser;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
}

export async function createStreak(userId: string): Promise<AirtableStreak> {
  const newStreak: Omit<AirtableStreak, 'id'> = {
    userId,
    currentStreak: 0,
    longestStreak: 0,
    lastUpdated: formatDateForAirtable(new Date())
  };
  const record = await base(TABLES.STREAKS).create(newStreak);
  return {
    id: record.id,
    ...record.fields
  } as AirtableStreak;
} 