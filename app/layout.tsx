import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getServerSession } from "next-auth/next";
import { SessionProvider } from "@/components/SessionProvider";

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dungeon Habit Tracker',
  description: 'Track your habits with a dungeon-themed adventure',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}