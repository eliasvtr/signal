'use client';

import { useState, useEffect } from 'react';
import { PlayCircle, MessageCircle, ExternalLink, BookmarkPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).twttr) {
      (window as any).twttr.widgets.load();
    }
  }, [activeTab, xLists]);

  function saveToRaindrop(url: string, title: string) {
    // This will open Raindrop's add URL API hook or standard intent
    // Raindrop has a cool intent feature: https://app.raindrop.io/add?link=...
    const raindropUrl = `https://app.raindrop.io/add?link=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
    window.open(raindropUrl, '_blank');
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

  return (
    <div className="w-full">
      <Script 
        src="https://platform.twitter.com/widgets.js" 
        strategy="afterInteractive" 
        onLoad={() => {
          if (typeof window !== 'undefined' && (window as any).twttr) {
            (window as any).twttr.widgets.load();
          }
        }}
      />
      {/* Scrollable Tabs */}
      <div className="flex overflow-x-auto gap-3 pb-6 border-b border-neutral-800 scrollbar-hide">
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
      <div className="mt-8 space-y-10 pb-24">
        {/* YOUTUBE RENDERER */}
        {activeTab === 'youtube' && youtube.map((item) => (
          <article key={item.id} className="group">
            <a href={item.url} target="_blank" rel="noreferrer" className="block relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800">
              {extractYTImage(item) ? (
                <img src={extractYTImage(item)!} alt={item.title} className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity" />
              ) : (
                 <div className="w-full h-full flex items-center justify-center text-neutral-600">
                   <PlayCircle className="w-12 h-12 opacity-50" />
                 </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <h2 className="text-white font-medium text-lg leading-tight line-clamp-2">{item.title}</h2>
                  <p className="text-neutral-300 flex items-center gap-2 mt-1.5 text-xs font-medium">
                    {item.__source} <span className="w-1 h-1 rounded-full bg-neutral-500" /> 
                    {item.date_published ? formatDistanceToNow(new Date(item.date_published)) + ' ago' : ''}
                  </p>
                </div>
              </div>
            </a>
            <div className="flex justify-end mt-3">
              <button onClick={() => saveToRaindrop(item.url, item.title)} className="text-neutral-500 hover:text-white flex items-center text-xs transition-colors p-2 rounded-lg hover:bg-neutral-900">
                 <BookmarkPlus className="w-4 h-4 mr-1.5" /> Save to Raindrop
              </button>
            </div>
          </article>
        ))}

        {/* X LIST RENDERER */}
        {activeTab !== 'youtube' && xLists.find(l => l.name === activeTab)?.items.map((item) => (
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
              <a href={item.url} target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-white flex items-center text-xs transition-colors p-2 -ml-2 rounded-lg hover:bg-neutral-900">
                 <ExternalLink className="w-4 h-4 mr-1.5" /> View on X
              </a>
              <button onClick={() => saveToRaindrop(item.url, item.author?.name ? `Tweet by ${item.author.name}` : 'Saved Tweet')} className="text-neutral-500 hover:text-white flex items-center text-xs transition-colors p-2 -mr-2 rounded-lg hover:bg-neutral-900">
                 <BookmarkPlus className="w-4 h-4 mr-1.5" /> Raindrop
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
  );
}
