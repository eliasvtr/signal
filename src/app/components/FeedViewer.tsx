'use client';

import { useState, useEffect } from 'react';
import { PlayCircle, MessageCircle, ExternalLink, BookmarkPlus, Maximize2, X, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { markAsSeen } from '../actions/feeds';
import { saveToRaindropAction } from '../actions/raindrop';
import Script from 'next/script';

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

export default function FeedViewer({ 
  youtube, 
  xLists 
}: { 
  youtube: FeedItem[], 
  xLists: { name: string, items: FeedItem[] }[] 
}) {
  const [activeTab, setActiveTab] = useState('youtube');
  const [activeTweet, setActiveTweet] = useState<FeedItem | null>(null);
  const [optimisticSeen, setOptimisticSeen] = useState<string[]>([]);
  const [playingYtVideo, setPlayingYtVideo] = useState<string | null>(null);
  const [savingItemUrl, setSavingItemUrl] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<string[]>([]);

  useEffect(() => {
    if (activeTweet && typeof window !== 'undefined' && (window as any).twttr) {
      // Reload widgets specifically when a tweet modal is triggered
      (window as any).twttr.widgets.load();
    }
  }, [activeTweet]);

  function handleMarkAsSeen(url: string) {
    setOptimisticSeen((prev) => [...prev, url]);
    markAsSeen(url); // Trigger Server Action in back background
  }

  async function saveToRaindrop(url: string, title: string) {
    if (savingItemUrl === url || savedItems.includes(url)) return;
    setSavingItemUrl(url);
    try {
      const res = await saveToRaindropAction(url, title);
      const err = (res as any).error;
      
      if (err) {
        // Fallback condition if API Access Token hasn't been posted yet
        if (err.includes('not configured')) {
          const raindropUrl = `https://app.raindrop.io/add?link=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
          window.open(raindropUrl, '_blank');
        } else {
          alert(`Raindrop Error: ${err}`);
        }
      } else {
        setSavedItems((prev) => [...prev, url]);
        handleMarkAsSeen(url); // Auto-hide card on successful Raindrop save
      }
    } catch {
      alert('Failed to save link to Raindrop.');
    } finally {
      setSavingItemUrl(null);
    }
  }

  function extractAuthorName(item: FeedItem) {
    if (item.content_text) {
       const match = item.content_text.match(/— ([^(@\n]+) \(@/);
       if (match) return match[1].trim();
    }
    return item.authors?.[0]?.name || item.author?.name || 'X User';
  }

  function cleanContentHtml(html: string) {
    if (!html) return '';
    // Strip Twitter embed footers inserted by RSS parsers
    return html.replace(/<\/p>— ([\s\S]*?)<\/blockquote>/, '</p></blockquote>');
  }

  // Parse Youtube Video ID from URL for iframe thumbnail embedding
  function extractYTImage(item: FeedItem) {
    const match = item.url.match(/(?:v=|youtu\.be\/|\/v\/|\/embed\/)([^&\n?#]+)/);
    if (match) return `https://i.ytimg.com/vi/${match[1]}/maxresdefault.jpg`;
    return null;
  }

  function extractYTId(url: string) {
    const match = url.match(/(?:v=|youtu\.be\/|\/v\/|\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  }

  return (
    <div className="w-full">
      <Script src="https://platform.twitter.com/widgets.js" strategy="afterInteractive" />

      <div className="flex flex-col md:flex-row gap-8 items-start w-full">
        {/* Scrollable Tabs / Sidebar */}
        <div className="w-full md:w-56 flex overflow-x-auto md:flex-col gap-2.5 pb-6 md:pb-0 border-b md:border-b-0 md:border-r border-neutral-800 sticky md:top-12 self-start md:pr-6 scrollbar-hide">
          <button 
            onClick={() => setActiveTab('youtube')}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors border
              ${activeTab === 'youtube' ? 'bg-white text-black border-white' : 'bg-transparent text-neutral-400 border-neutral-800 hover:border-neutral-600'}`}
          >
            YouTube Timeline
          </button>
          {xLists.map((list) => (
            <button
              key={list.name}
              onClick={() => setActiveTab(list.name)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors border
                ${activeTab === list.name ? 'bg-white text-black border-white' : 'bg-transparent text-neutral-400 border-neutral-800 hover:border-neutral-600'}`}
            >
              {list.name}
            </button>
          ))}
        </div>

        {/* Content Rendering */}
        <div className="flex-1 space-y-8 pb-24 w-full">
        {/* YOUTUBE RENDERER */}
        {activeTab === 'youtube' && youtube.filter(item => !optimisticSeen.includes(item.url)).map((item) => {
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
              <button onClick={() => handleMarkAsSeen(item.url)} className="text-neutral-500 hover:text-green-500 flex items-center text-xs transition-colors p-2 -ml-2 rounded-lg hover:bg-neutral-900">
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
        ); })}

        {/* X LIST RENDERER */}
        {activeTab !== 'youtube' && (xLists.find(l => l.name === activeTab)?.items || []).filter(item => !optimisticSeen.includes(item.url)).map((item) => (
          <article key={item.id} className="border border-neutral-800 bg-[#0A0A0A] rounded-2xl p-5 hover:border-neutral-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-neutral-500" />
                <span className="font-medium text-sm text-neutral-300">
                  {extractAuthorName(item)}
                </span>
              </div>
              <span className="text-xs text-neutral-500">
                {item.date_published ? formatDistanceToNow(new Date(item.date_published), { addSuffix: true }) : ''}
              </span>
            </div>
            
            <div 
              className="text-neutral-200 text-sm leading-relaxed whitespace-pre-wrap break-words [&>a]:text-blue-400 [&>img]:mt-4 [&>img]:rounded-xl [&>img]:border [&>img]:border-neutral-800"
              dangerouslySetInnerHTML={{ __html: cleanContentHtml(item.content_html || item.title) }} 
            />

            {/* Render direct Images from Feed Item Nodes (common with RSS.app) */}
            {item.image && (
              <div className="mt-4">
                <img src={item.image} alt={item.title} className="rounded-xl border border-neutral-800 max-w-full h-auto object-cover" />
              </div>
            )}

            {/* Render Attachments/Media Enclosures */}
            {item.attachments && item.attachments.length > 0 && (
              <div className="mt-4 space-y-3">
                {item.attachments.map((attach: any, idx: number) => (
                  (attach.mime_type?.startsWith('image/') || attach.url?.includes('pbs.twimg.com')) && attach.url !== item.image ? (
                    <img key={idx} src={attach.url} alt={`Media ${idx}`} className="rounded-xl border border-neutral-800 max-w-full h-auto" />
                  ) : null
                ))}
              </div>
            )}

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-800/50">
              <div className="flex items-center gap-1">
                <button onClick={() => handleMarkAsSeen(item.url)} className="text-neutral-500 hover:text-green-500 flex items-center text-xs transition-colors p-2 -ml-2 rounded-lg hover:bg-neutral-900">
                   <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark Seen
                </button>
                <button onClick={() => setActiveTweet(item)} className="text-neutral-500 hover:text-white flex items-center text-xs transition-colors p-2 rounded-lg hover:bg-neutral-900">
                   <Maximize2 className="w-4 h-4 mr-1.5" /> Expand Layout
                </button>
              </div>
              <button 
                onClick={() => saveToRaindrop(item.url, `X Post by ${extractAuthorName(item)}: ${item.title}`)} 
                disabled={savingItemUrl === item.url || savedItems.includes(item.url)}
                className="text-neutral-500 hover:text-white flex items-center text-xs transition-colors p-2 -mr-2 rounded-lg hover:bg-neutral-900 disabled:text-green-500"
              >
                 <BookmarkPlus className="w-4 h-4 mr-1.5" /> 
                 {savingItemUrl === item.url ? 'Saving...' : savedItems.includes(item.url) ? 'Saved!' : 'Raindrop'}
              </button>
            </div>
          </article>
        ))}
        
        {activeTab === 'youtube' && youtube.length === 0 && (
           <p className="text-center text-neutral-500 italic py-12">No recent videos.</p>
        )}
        
        {activeTab !== 'youtube' && xLists.find(l => l.name === activeTab)?.items.length === 0 && (
           <p className="text-center text-neutral-500 italic py-12">No recent posts matched on RSS.</p>
        )}
      </div>
      </div>

      {/* Pop-up Interactive Embed Modal */}
      {activeTweet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1C1C1E] border border-neutral-800 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto relative p-6 pt-12 shadow-2xl">
            <button 
              onClick={() => setActiveTweet(null)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors bg-black/50 hover:bg-black rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </button>
            <div 
               className="w-full flex justify-center"
               dangerouslySetInnerHTML={{ __html: (activeTweet.content_html || activeTweet.title).replace('class="twitter-tweet"', 'class="twitter-tweet" data-theme="dark"') }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
