import { db } from '../db';
import { feeds } from '../db/schema';
import { addFeed, deleteFeed } from '../actions/feeds';
import { Trash2, Plus, LogOut } from 'lucide-react';
import { logout } from '../actions/auth';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const allFeeds = await db.select().from(feeds);

  const xLists = allFeeds.filter(f => f.type === 'x_list');
  const youtubeChannels = allFeeds.filter(f => f.type === 'youtube');

  async function handleLogout() {
    'use server';
    await logout();
    redirect('/login');
  }

  return (
    <div className="min-h-[100dvh] bg-black text-white p-6 sm:p-12 font-sans selection:bg-neutral-800">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-light tracking-wide">Data Sources</h1>
          <form action={handleLogout}>
            <button className="flex items-center text-sm text-neutral-400 hover:text-white transition-colors">
              <LogOut className="w-4 h-4 mr-2" />
              Lock App
            </button>
          </form>
        </div>

        {/* Add Feed Form */}
        <div className="bg-[#1C1C1E] p-6 rounded-2xl mb-12 border border-neutral-800">
          <h2 className="text-xl font-medium mb-6">Add New Source</h2>
          <form action={addFeed} className="flex flex-col sm:flex-row gap-4">
            <select name="type" className="bg-black border border-neutral-700 rounded-lg p-3 text-sm focus:outline-none focus:border-neutral-500 transition-colors">
              <option value="youtube">YouTube Channel</option>
              <option value="x_list">X (Twitter) List</option>
            </select>
            <input 
              name="name" 
              type="text" 
              placeholder="e.g. MKBHD or Tech News" 
              required
              className="flex-1 bg-black border border-neutral-700 rounded-lg p-3 text-sm focus:outline-none focus:border-neutral-500 transition-colors placeholder:text-neutral-600"
            />
            <input 
              name="url" 
              type="text" 
              placeholder="URL or Channel ID" 
              required
              className="flex-1 bg-black border border-neutral-700 rounded-lg p-3 text-sm focus:outline-none focus:border-neutral-500 transition-colors placeholder:text-neutral-600"
            />
            <button type="submit" className="bg-white text-black px-6 py-3 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center">
              <Plus className="w-4 h-4 mr-1" /> Add
            </button>
          </form>
          <p className="text-xs text-neutral-500 mt-4 leading-relaxed">
            * For **YouTube**, copy the URL of the channel (e.g. `https://www.youtube.com/@mkbhd`).<br/>
            * For **X Lists**, copy the URL of the public list (e.g. `https://x.com/i/lists/123456789`).
          </p>
        </div>

        {/* Managed Feeds */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              YouTube Subscriptions <span className="ml-3 bg-neutral-800 text-xs py-0.5 px-2 rounded-full">{youtubeChannels.length}</span>
            </h3>
            <ul className="space-y-3">
              {youtubeChannels.map((feed) => (
                <li key={feed.id} className="group flex justify-between items-center bg-[#1C1C1E] p-4 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors">
                  <div className="truncate pr-4">
                    <p className="font-medium text-sm text-white truncate">{feed.name}</p>
                    <p className="text-xs text-neutral-500 truncate mt-1">{feed.url}</p>
                  </div>
                  <form action={async () => { 'use server'; await deleteFeed(feed.id); }}>
                    <button className="text-neutral-500 hover:text-red-500 transition-colors p-2 bg-black rounded-full opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </li>
              ))}
              {youtubeChannels.length === 0 && (
                <p className="text-sm text-neutral-600 italic px-2">No YouTube channels added yet.</p>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              X (Twitter) Lists <span className="ml-3 bg-neutral-800 text-xs py-0.5 px-2 rounded-full">{xLists.length}</span>
            </h3>
            <ul className="space-y-3">
              {xLists.map((feed) => (
                <li key={feed.id} className="group flex justify-between items-center bg-[#1C1C1E] p-4 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors">
                  <div className="truncate pr-4">
                    <p className="font-medium text-sm text-white truncate">{feed.name}</p>
                    <p className="text-xs text-neutral-500 truncate mt-1">{feed.url}</p>
                  </div>
                  <form action={async () => { 'use server'; await deleteFeed(feed.id); }}>
                    <button className="text-neutral-500 hover:text-red-500 transition-colors p-2 bg-black rounded-full opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </li>
              ))}
              {xLists.length === 0 && (
                <p className="text-sm text-neutral-600 italic px-2">No X lists added yet.</p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
