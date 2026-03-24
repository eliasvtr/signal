import { db } from '../../db';
import { feeds, seenItems } from '../../db/schema';

export const dynamic = 'force-dynamic';

export default async function TestFeedPage() {
  const allFeeds = await db.select().from(feeds);
  const seen = await db.select().from(seenItems);
  const seenUrls = seen.map(s => s.itemUrl);
  
  const youtube = allFeeds.filter(f => f.type === 'youtube');
  const BRIDGE_URL = process.env.RSS_BRIDGE_URL || 'https://rss-bridge.org/bridge01/';

  const results = [];

  for (const f of youtube.slice(0, 3)) { // Test first 3
    let fetchUrl = `${BRIDGE_URL}`;
    let bridgePath = '';
    
    if (f.url.startsWith('http') && !f.url.includes('youtube.com/') && !f.url.includes('youtu.be/')) {
      fetchUrl = f.url;
    } else {
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

    let status = 'Pending';
    let dataSnippet = 'None';
    let itemsCount = 0;

    try {
      const res = await fetch(fetchUrl, { next: { revalidate: 0 } });
      status = `${res.status} ${res.statusText}`;
      const text = await res.text();
      dataSnippet = text.slice(0, 300);
      try {
        const json = JSON.parse(text);
        itemsCount = json.items?.length || 0;
      } catch {}
    } catch (e: any) {
      status = 'Fetch Error';
      dataSnippet = e.message;
    }

    results.push({ name: f.name, url: f.url, fetchUrl, status, itemsCount, dataSnippet });
  }

  return (
    <div className="p-8 bg-black text-white font-mono text-sm">
      <h1 className="text-xl mb-4">Diagnostics</h1>
      <p className="mb-2"><strong>RSS_BRIDGE_URL (Env):</strong> {process.env.RSS_BRIDGE_URL || 'NOT SET'}</p>
      <p className="mb-6"><strong>Resolved Bridge URL:</strong> {BRIDGE_URL}</p>
      
      <div className="space-y-6">
        {results.map((r, i) => (
          <div key={i} className="border border-neutral-800 p-4 rounded-lg">
            <h2 className="font-bold text-blue-400">{r.name}</h2>
            <p>Original: {r.url}</p>
            <p className="break-all">Fetch URL: <span className="text-neutral-500">{r.fetchUrl}</span></p>
            <p>Status: <span className={r.status.includes('200') ? 'text-green-500' : 'text-red-500'}>{r.status}</span></p>
            <p>Count: {r.itemsCount} items</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-neutral-400">View response snippet</summary>
              <pre className="p-2 bg-neutral-900 rounded mt-1 overflow-auto max-w-full text-xs">
                {r.dataSnippet}
              </pre>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
