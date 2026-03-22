import Link from 'next/link';
import { db } from '../db';
import { feeds } from '../db/schema';
import { Settings } from 'lucide-react';

export default async function Home() {
  const allFeeds = await db.select().from(feeds);

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col pt-12 px-6 font-sans">
      <div className="max-w-xl mx-auto w-full">
        <header className="flex justify-between items-center mb-10 border-b border-neutral-800 pb-4">
          <h1 className="text-2xl font-light tracking-wider">T I M E L I N E</h1>
          <Link href="/admin" className="text-neutral-500 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </Link>
        </header>

        {allFeeds.length === 0 ? (
          <div className="text-center text-neutral-500 mt-24">
            <p className="mb-6">Your feeds are currently clean and distraction-free.</p>
            <Link href="/admin" className="text-sm bg-white text-black px-6 py-2.5 rounded-full hover:bg-neutral-200 transition-colors font-medium">
              Add some channels
            </Link>
          </div>
        ) : (
          <div className="text-center text-neutral-500 mt-24 italic">
            Feed aggregator UI goes here...
          </div>
        )}
      </div>
    </div>
  );
}
