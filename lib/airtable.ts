// Polyfill AbortController/AbortSignal for Airtable SDK in serverless environments
// (No longer needed since we are removing the SDK)

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
  githubId?: string;
  discordId?: string;
  discordUsername?: string;
  linkedProviders?: string[];
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
  const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Submissions?filterByFormula=${encodeURIComponent(`{userId} = '${userId}'`)}&maxRecords=${limit}&sort[0][field]=date&sort[0][direction]=desc`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  });
  if (!res.ok) {
    console.error('[Airtable REST] Error fetching submissions:', await res.text());
    return [];
  }
  const data = await res.json();
  return (data.records || []).map((record: any) => ({
    id: record.id,
    ...record.fields
  })) as AirtableSubmission[];
}

export async function createSubmission(submission: Omit<AirtableSubmission, 'id'>): Promise<AirtableSubmission> {
  // Ensure date fields are YYYY-MM-DD strings
  const fields: any = { ...submission };
  if (fields.createdAt) fields.createdAt = new Date(fields.createdAt).toISOString().split('T')[0];
  if (fields.updatedAt) fields.updatedAt = new Date(fields.updatedAt).toISOString().split('T')[0];
  const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Submissions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error('[Airtable REST] Error creating submission: ' + await res.text());
  }
  const record = await res.json();
  return {
    id: record.id,
    ...record.fields
  } as AirtableSubmission;
}

export async function updateSubmission(id: string, submission: Partial<AirtableSubmission>): Promise<AirtableSubmission> {
  // Ensure date fields are YYYY-MM-DD strings
  const fields: any = { ...submission };
  if (fields.createdAt) fields.createdAt = new Date(fields.createdAt).toISOString().split('T')[0];
  if (fields.updatedAt) fields.updatedAt = new Date(fields.updatedAt).toISOString().split('T')[0];
  const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Submissions/${id}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error('[Airtable REST] Error updating submission: ' + await res.text());
  }
  const record = await res.json();
  return {
    id: record.id,
    ...record.fields
  } as AirtableSubmission;
}

export async function getUserStreak(userId: string): Promise<AirtableStreak> {
  const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Streaks?filterByFormula=${encodeURIComponent(`{userId} = '${userId}'`)}&maxRecords=1`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  });
  if (!res.ok) {
    console.error('[Airtable REST] Error fetching streak:', await res.text());
    return {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastUpdated: formatDateForAirtable(new Date())
    };
  }
  const data = await res.json();
  if (!data.records || data.records.length === 0) {
    return {
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastUpdated: formatDateForAirtable(new Date())
    };
  }
  const record = data.records[0];
  return {
    id: record.id,
    ...record.fields
  } as AirtableStreak;
}

export async function updateUserStreak(id: string, streak: Partial<AirtableStreak>): Promise<AirtableStreak> {
  // Ensure date fields are YYYY-MM-DD strings
  const fields: any = { ...streak };
  if (fields.lastUpdated) fields.lastUpdated = new Date(fields.lastUpdated).toISOString().split('T')[0];
  const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Streaks/${id}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error('[Airtable REST] Error updating streak: ' + await res.text());
  }
  const record = await res.json();
  return {
    id: record.id,
    ...record.fields
  } as AirtableStreak;
}

export async function createOrUpdateUser(user: Omit<AirtableUser, 'id'>): Promise<AirtableUser> {
  // Try to find the user first
  const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Users?filterByFormula=${encodeURIComponent(`{email} = '${user.email}'`)}&maxRecords=1`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error('[Airtable REST] Error fetching user: ' + await res.text());
  }
  const data = await res.json();
  const formatUserDates = (fields: any) => {
    if (fields.createdAt) fields.createdAt = new Date(fields.createdAt).toISOString().split('T')[0];
    return fields;
  };
  if (data.records && data.records.length > 0) {
    // Update existing user
    const id = data.records[0].id;
    const updateUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Users/${id}`;
    const updateFields = formatUserDates(user);
    const updateRes = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: updateFields }),
      cache: 'no-store'
    });
    if (!updateRes.ok) {
      throw new Error('[Airtable REST] Error updating user: ' + await updateRes.text());
    }
    const record = await updateRes.json();
    return {
      id: record.id,
      ...record.fields
    } as AirtableUser;
  } else {
    // Create new user
    const createUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Users`;
    const createFields = formatUserDates(user);
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: createFields }),
      cache: 'no-store'
    });
    if (!createRes.ok) {
      throw new Error('[Airtable REST] Error creating user: ' + await createRes.text());
    }
    const record = await createRes.json();
    return {
      id: record.id,
      ...record.fields
    } as AirtableUser;
  }
}

export async function createStreak(userId: string): Promise<AirtableStreak> {
  const newStreak: Omit<AirtableStreak, 'id'> = {
    userId,
    currentStreak: 0,
    longestStreak: 0,
    lastUpdated: new Date().toISOString().split('T')[0]
  };
  const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Streaks`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: newStreak }),
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error('[Airtable REST] Error creating streak: ' + await res.text());
  }
  const record = await res.json();
  return {
    id: record.id,
    ...record.fields
  } as AirtableStreak;
}

export async function getUserByDiscord(discordIdentifier: string): Promise<AirtableUser | null> {
  // Try to find user by Discord ID first
  let url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Users?filterByFormula=${encodeURIComponent(`{discordId} = '${discordIdentifier}'`)}&maxRecords=1`;
  let res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  });

  if (!res.ok) {
    console.error('[Airtable REST] Error fetching user by Discord ID:', await res.text());
    return null;
  }

  let data = await res.json();
  
  // If not found by ID, try username
  if (!data.records || data.records.length === 0) {
    url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Users?filterByFormula=${encodeURIComponent(`{discordUsername} = '${discordIdentifier}'`)}&maxRecords=1`;
    res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error('[Airtable REST] Error fetching user by Discord username:', await res.text());
      return null;
    }

    data = await res.json();
  }

  if (!data.records || data.records.length === 0) {
    return null;
  }

  return {
    id: data.records[0].id,
    ...data.records[0].fields
  } as AirtableUser;
} 