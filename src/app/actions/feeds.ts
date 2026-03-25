'use server';

import { db } from '../../db';
import { feeds, seenItems, watchlistItems } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function markAsSeen(itemUrl: string) {
  try {
    await db.insert(seenItems).values({ itemUrl }).onConflictDoNothing();
    revalidatePath('/');
    revalidatePath('/watchlist');
    return { success: true };
  } catch {
    return { error: 'Failed to mark as seen' };
  }
}

export async function addFeed(formData: FormData) {
  const name = formData.get('name') as string;
  const url = formData.get('url') as string;
  const type = formData.get('type') as string;

  if (!name || !url || !type) return { error: 'All fields required' };

  await db.insert(feeds).values({
    name,
    url,
    type
  });

  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export async function deleteFeed(id: number) {
  await db.delete(feeds).where(eq(feeds.id, id));
  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export async function addToWatchlist(item: any) {
  try {
    await db.insert(watchlistItems).values({
      itemUrl: item.url,
      data: JSON.stringify(item),
    }).onConflictDoNothing();
    revalidatePath('/');
    revalidatePath('/watchlist');
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: 'Failed to add to watchlist' };
  }
}

export async function removeFromWatchlist(itemUrl: string) {
  try {
    await db.delete(watchlistItems).where(eq(watchlistItems.itemUrl, itemUrl));
    revalidatePath('/watchlist');
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: 'Failed to remove from watchlist' };
  }
}
