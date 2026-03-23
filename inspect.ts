import { db } from './src/db';
import { feeds } from './src/db/schema';

async function main() {
  const allFeeds = await db.select().from(feeds);
  const xFeeds = allFeeds.filter(f => f.type === 'x_list' && f.url.startsWith('http'));
  
  if (xFeeds.length === 0) {
    console.log("No RSS app feeds found.");
    return;
  }

  const target = xFeeds[0];
  console.log(`Fetching: ${target.name} (${target.url})`);

  try {
    const res = await fetch(target.url);
    const data = await res.json();
    console.log(`\nFound ${data.items ? data.items.length : 0} items total.`);

    // Find a retweet or quote tweet
    const retweet = (data.items || []).find((i: any) => 
        (i.content_text && (i.content_text.includes('RT') || i.content_text.includes('Retweeted'))) ||
        (i.title && i.title.toLowerCase().includes('rt'))
    );
    
    if (retweet) {
        console.log("\n--- FOUND RETWEET / QUOTE ---");
        console.log(JSON.stringify(retweet, null, 2));
    } else {
        console.log("\nNo items seem to be retweets in this stream.");
        // Just log one item with media or ANY text that isn't the first item
        console.log(JSON.stringify(data.items?.[3] || data.items?.[1] || {}, null, 2));
    }
  } catch (e: any) {
    console.error("Fetch failed", e.message);
  }
}

main();
