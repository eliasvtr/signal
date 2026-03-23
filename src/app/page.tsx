import Link from 'next/link';
import { db } from '../db';
import { feeds } from '../db/schema';
import { Settings } from 'lucide-react';
import FeedViewer from './components/FeedViewer';

// Fetch helper - defaults to Railway Bridge instance
const BRIDGE_URL = process.env.RSS_BRIDGE_URL || 'https://rss-bridge-production-2c70.up.railway.app';

async function fetchAllFeedsData() {
  const allFeeds = await db.select().from(feeds);
  
  const [youtube, xLists] = [
    allFeeds.filter(f => f.type === 'youtube'),
    allFeeds.filter(f => f.type === 'x_list')
  ];

  // Fetch all youtube feeds
  const ytPromises = youtube.map(async (f) => {
    let fetchUrl = `${BRIDGE_URL}`;
    
    if (f.url.startsWith('http') && !f.url.includes('youtube.com/') && !f.url.includes('youtu.be/')) {
      fetchUrl = f.url; // Absolute feed URL (e.g., RSS.app)
    } else {
      let bridgePath = '';
      if (f.url.includes('@')) {
         const match = f.url.match(/@([a-zA-Z0-9_\-\.]+)/);
         if (match) bridgePath = `?action=display&bridge=Youtube&context=By+custom+name&custom=%40${match[1]}&format=Json`;
      } else if (f.url.includes('channel/')) {
         const match = f.url.match(/channel\/([a-zA-Z0-9_\-]+)/);
         if (match) bridgePath = `?action=display&bridge=Youtube&context=By+channel+id&c=${match[1]}&format=Json`;
      } else {
         const match = f.url.split('/').pop();
         bridgePath = `?action=display&bridge=Youtube&context=By+username&u=${match}&format=Json`;
      }
      fetchUrl = `${BRIDGE_URL}${bridgePath}`;
    }

    try {
      const res = await fetch(fetchUrl, { next: { revalidate: 0 } });
      const data = await res.json();
      return (data.items || []).map((i: any) => ({ ...i, __source: f.name, __sourceType: 'youtube' }));
    } catch { return []; }
  });

  // Fetch all X lists
  const xPromises = xLists.map(async (f) => {
    let fetchUrl = `${BRIDGE_URL}`;

    if (f.url.startsWith('http') && !f.url.includes('twitter.com') && !f.url.includes('x.com')) {
      fetchUrl = f.url; // Absolute feed URL (e.g., RSS.app)
    } else {
      let bridgePath = '';
      const match = f.url.match(/lists\/(\d+)/);
      const listId = match ? match[1] : f.url.split('/').pop();
      bridgePath = `?action=display&bridge=Twitter&context=By+list+ID&listid=${listId}&format=Json`;
      fetchUrl = `${BRIDGE_URL}${bridgePath}`;
    }

    try {
      const res = await fetch(fetchUrl, { next: { revalidate: 0 } });
      const data = await res.json();
      return (data.items || []).map((i: any) => ({ ...i, __source: f.name, __sourceType: 'x_list' }));
    } catch { return []; }
  });

  const [ytResults, xResults] = await Promise.all([
    Promise.all(ytPromises),
    Promise.all(xPromises)
  ]);

  const allYtItems = ytResults.flat().sort((a, b) => new Date(b.date_published).getTime() - new Date(a.date_published).getTime());
  
  const groupedX = xLists.map((list, idx) => ({
    name: list.name,
    items: xResults[idx]
  }));

  return { youtubeTimeline: allYtItems, xPlaylists: groupedX };
}


export default async function Home() {
  const { youtubeTimeline, xPlaylists } = await fetchAllFeedsData();

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col pt-12 px-5 font-sans pb-20 selection:bg-neutral-800">
      <div className="max-w-xl mx-auto w-full">
        <header className="flex justify-between items-center mb-10 pb-4">
          <h1 className="text-2xl font-light tracking-wide text-white">S I G N A L</h1>
          <Link href="/admin" className="text-neutral-500 hover:text-white transition-colors bg-neutral-900 border border-neutral-800 p-2 rounded-full">
            <Settings className="w-4 h-4" />
          </Link>
        </header>

        {youtubeTimeline.length === 0 && xPlaylists.length === 0 ? (
          <div className="text-center text-neutral-500 mt-24">
            <p className="mb-6 leading-relaxed">Your feeds are currently clean and distraction-free.<br/>Click the gear icon to add sources.</p>
          </div>
        ) : (
          <FeedViewer youtube={youtubeTimeline} xLists={xPlaylists} />
        )}
      </div>
    </div>
  );
}
