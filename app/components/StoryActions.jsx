"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { archiveStory, deleteStoryPermanently, restoreStory } from '../actions';
import { Trash, ArchiveTray, ArrowUUpLeft } from '@phosphor-icons/react';

export default function StoryActions({ storyId, isArchived }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (actionType) => {
    const password = prompt("Please enter the secret password to confirm:");
    if (!password) return;

    setLoading(true);
    try {
      if (actionType === 'archive') {
        await archiveStory(storyId, password);
        alert("Memory archived successfully. It will be permanently deleted after 3 days.");
        router.push('/');
      } else if (actionType === 'restore') {
        await restoreStory(storyId, password);
        alert("Memory restored successfully.");
        router.push('/');
      } else if (actionType === 'delete') {
        if (confirm("Are you sure you want to delete this memory permanently? This cannot be undone.")) {
          await deleteStoryPermanently(storyId, password);
          alert("Memory permanently deleted.");
          router.push('/archive');
        }
      }
      router.refresh();
    } catch (error) {
      alert(error.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (isArchived) {
    return (
      <div className="flex gap-4 mt-8 pt-8 border-t border-border">
        <button
          onClick={() => handleAction('restore')}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-opacity uppercase tracking-widest text-sm"
        >
          <ArrowUUpLeft size={20} />
          {loading ? 'Processing...' : 'Restore'}
        </button>
        <button
          onClick={() => handleAction('delete')}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-500/20 transition-colors uppercase tracking-widest text-sm border border-red-500/20"
        >
          <Trash size={20} />
          {loading ? 'Processing...' : 'Delete Permanently'}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-8 border-t border-border">
      <button
        onClick={() => handleAction('archive')}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-500/20 transition-colors uppercase tracking-widest text-sm border border-red-500/20"
      >
        <ArchiveTray size={20} />
        {loading ? 'Archiving...' : 'Move to Archive'}
      </button>
    </div>
  );
}
