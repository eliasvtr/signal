'use client';

import { useState } from 'react';
import { PlayCircle, BookmarkPlus, CheckCircle2, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { markAsSeen, removeFromWatchlist } from '../actions/feeds';
import { saveToRaindropAction } from '../actions/raindrop';
import Link from 'next/link';

type FeedItem = {
  id: string;
  title: string;
  url: string;
  date_published: string;
  content_html?: string;
  content_text?: string;
  author?: { name: string };
  authors?: { name: string }[];
  __source: string;
  __sourceType: string;
  image?: string;
  attachments?: { url: string; mime_type: string }[];
};

export default function WatchlistViewer({ items }: { items: FeedItem[] }) {
  const [removedUrls, setRemovedUrls] = useState<string[]>([]);
  const [playingYtVideo, setPlayingYtVideo] = useState<string | null>(null);
  const [savingItemUrl, setSavingItemUrl] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<string[]>([]);

  async function handleMarkSeen(url: string) {
    setRemovedUrls((prev) => [...prev, url]);
    await markAsSeen(url);
    await removeFromWatchlist(url);
  }

  async function saveToRaindrop(url: string, title: string) {
    if (savingItemUrl === url || savedItems.includes(url)) return;
    setSavingItemUrl(url);
    try {
      const res = await saveToRaindropAction(url, title);
      const err = (res as any).error;
      
      if (err) {
        if (err.includes('not configured')) {
          const raindropUrl = `https://app.raindrop.io/add?link=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
          window.open(raindropUrl, '_blank');
        } else {
          alert(`Raindrop Error: ${err}`);
        }
      } else {
        setSavedItems((prev) => [...prev, url]);
        // Also remove from watchlist after successful raindrop save?
        // User said: "On that page we could have the same layout ie a button to add to Raindrop or Mark Seen"
        // Usually saving to Raindrop means you're done with it here.
        handleMarkSeen(url);
      }
    } catch {
      alert('Failed to save link to Raindrop.');
    } finally {
      setSavingItemUrl(null);
    }
  }

  function extractYTImage(item: FeedItem) {
    const match = item.url.match(/(?:v=|youtu\.be\/|\/v\/|\/embed\/)([^&\n?#]+)/);
    if (match) return `https://i.ytimg.com/vi/${match[1]}/maxresdefault.jpg`;
    return null;
  }

  function extractYTId(url: string) {
    const match = url.match(/(?:v=|youtu\.be\/|\/v\/|\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  }

  const visibleItems = items.filter(i => !removedUrls.includes(i.url));

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-neutral-500 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-xl font-medium">Watchlist</h2>
      </div>

      {visibleItems.length === 0 ? (
        <div className="text-center text-neutral-500 py-24">
          <p>Your watchlist is empty.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {visibleItems.map((item) => {
            const ytId = extractYTId(item.url);
            return (
              <article key={item.id} className="group">
                {playingYtVideo === item.id && ytId ? (
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-neutral-800 shadow-lg">
                    <iframe 
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1`} 
                      className="absolute inset-0 w-full h-full" 
                      allow="autoplay; encrypted-media" 
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <button 
                    onClick={() => setPlayingYtVideo(item.id)} 
                    className="block text-left w-full relative aspect-video rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 group"
                  >
                    {extractYTImage(item) ? (
                      <img src={extractYTImage(item)!} alt={item.title} className="object-cover w-full h-full opacity-80 group-hover:opacity-95 transition-opacity" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-neutral-600">
                         <PlayCircle className="w-12 h-12 opacity-50" />
                       </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div>
                        <h2 className="text-white font-medium text-lg leading-tight line-clamp-2">{item.title}</h2>
                        <p className="text-neutral-300 flex items-center gap-2 mt-1.5 text-xs font-medium">
                          {item.__source} <span className="w-1 h-1 rounded-full bg-neutral-500" /> 
                          {item.date_published ? formatDistanceToNow(new Date(item.date_published)) + ' ago' : ''}
                        </p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-full p-3 border border-white/10 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all shadow-xl">
                        <PlayCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </button>
                )}
                <div className="flex justify-between items-center mt-3">
                  <button onClick={() => handleMarkSeen(item.url)} className="text-neutral-500 hover:text-green-500 flex items-center text-xs transition-colors p-2 -ml-2 rounded-lg hover:bg-neutral-900">
                     <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark Seen
                  </button>
                  <button 
                    onClick={() => saveToRaindrop(item.url, item.title)} 
                    disabled={savingItemUrl === item.url || savedItems.includes(item.url)}
                    className="text-neutral-500 hover:text-white flex items-center text-xs transition-colors p-2 -mr-2 rounded-lg hover:bg-neutral-900 disabled:text-green-500"
                  >
                     <BookmarkPlus className="w-4 h-4 mr-1.5" /> 
                     {savingItemUrl === item.url ? 'Saving...' : savedItems.includes(item.url) ? 'Saved!' : 'Raindrop'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
