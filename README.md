# Dungeon Crawl Habit Tracker

A gamified habit tracking application built with Next.js 13, featuring a dungeon-themed interface where users can track their daily habits and build streaks to reveal ancient runes and defeat weekly bosses.

## 🚀 Features

- **Dungeon-Themed Interface**: Track habits through an engaging dungeon crawler theme
- **Habit Streaks**: Build and maintain streaks to reveal special rewards
- **Weekly Bosses**: Challenge yourself with weekly goals
- **User Authentication**: Secure login system using NextAuth.js
- **Responsive Design**: Works seamlessly on both desktop and mobile devices
- **Theme Support**: Light and dark mode with customizable themes
- **Real-time Updates**: Track your progress as you complete habits

## 🛠️ Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI (Radix UI)
- **Authentication**: NextAuth.js
- **Form Handling**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Package Manager**: pnpm
- **Database**: Airtable

## 📦 Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd dungeon-crawl
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file with the following variables:
```env
# Airtable Configuration
AIRTABLE_API_KEY=your_api_key_here
AIRTABLE_BASE_ID=your_base_id_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth (if using GitHub auth)
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
```

4. Run the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
├── app/                 # Next.js 13 app directory
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   └── ...            # Feature-specific components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and configurations
├── public/            # Static assets
└── types/             # TypeScript type definitions
```

## 🎮 How to Use

1. Sign in to your account
2. View your dungeon grid showing your habit tracking progress
3. Complete daily habits to build streaks
4. Unlock special rewards and defeat weekly bosses
5. Track your progress through the dungeon-themed interface

## 📊 Airtable Setup

The application uses Airtable as its database. Follow these steps to set up your Airtable base:

### Getting Airtable Credentials

1. Go to your Airtable account
2. Click on your profile icon → API documentation
3. Copy your API key
4. For the Base ID, go to your base and look at the URL: `https://airtable.com/appXXXXXXXXXXXXXX/...` - the `appXXXXXXXXXXXXXX` part is your Base ID

### Required Tables

Create three tables in your Airtable base with the following structure:

1. **Submissions Table**
```
Fields:
- userId (Single line text)
- date (Date)
- submissionText (Long text)
- streakCount (Number)
- createdAt (Date)
- updatedAt (Date)
```

2. **Users Table**
```
Fields:
- email (Single line text)
- name (Single line text)
- avatarUrl (Single line text)
- createdAt (Date)
```

3. **Streaks Table**
```
Fields:
- userId (Single line text)
- currentStreak (Number)
- longestStreak (Number)
- lastUpdated (Date)
```

### Important Notes

1. Field names in Airtable must match exactly with the interfaces in the code
2. For date fields:
   - Set the field type to "Date"
   - The code sends dates in ISO format (YYYY-MM-DD)
   - Airtable handles date formatting automatically
3. For number fields:
   - Set the field type to "Number"
   - No decimal places needed for streak counts
4. For text fields:
   - `userId` and `email` should be "Single line text"
   - `submissionText` should be "Long text" for longer submissions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details. 