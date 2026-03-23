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
    console.log("\n--- SINGLE ITEM SNAPSHOT ---");
    console.log(JSON.stringify(data.items?.[0] || {}, null, 2));
    
    // Check item with multiple images if any
    const multiImage = (data.items || []).find((i: any) => JSON.stringify(i).includes('pbs.twimg.com'));
    
    if (multiImage) {
        console.log("\n--- FOUND ITEM WITH IMAGES ---");
        console.log(JSON.stringify(multiImage, null, 2));
    } else {
        console.log("\nNo items have images (pbs.twimg.com) in this page.");
    }
    
    // Let's also log ALL keys in the item object to check for other variations
    const genericItem = data.items?.[0] || {};
    console.log("\nAvailable Keys:", Object.keys(genericItem));
  } catch (e: any) {
    console.size = 1000;
    console.error("Fetch failed", e.message);
  }
}

main();
