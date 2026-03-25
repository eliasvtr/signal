import { db } from '../../db';
import { watchlistItems } from '../../db/schema';
import WatchlistViewer from '../components/WatchlistViewer';

export default async function WatchlistPage() {
  const items = await db.select().from(watchlistItems);
  
  // The data is stored as JSON string in the DB
  const parsedItems = items.map(item => {
    try {
      return JSON.parse(item.data);
    } catch {
      return null;
    }
  }).filter(Boolean);

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col pt-12 px-5 font-sans pb-20 selection:bg-neutral-800">
      <div className="max-w-xl md:max-w-4xl mx-auto w-full transition-all">
        <WatchlistViewer items={parsedItems} />
      </div>
    </div>
  );
}
