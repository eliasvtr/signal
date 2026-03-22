'use server';

import { db } from '../db';
import { feeds } from '../db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

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
