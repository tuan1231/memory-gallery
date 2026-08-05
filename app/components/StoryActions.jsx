"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { archiveStory, deleteStoryPermanently, restoreStory } from '../lib/actions';
import { Trash, Archive, ArrowUUpLeft, X } from '@phosphor-icons/react';

export default function StoryActions({ storyId, isArchived }) {
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, action: null });
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const openModal = (actionType) => {
    setModalState({ isOpen: true, action: actionType });
    setErrorMsg('');
  };

  const closeModal = () => {
    setModalState({ isOpen: false, action: null });
  };

  const handleConfirm = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (modalState.action === 'archive') {
        await archiveStory(storyId);
        alert("Moved to archive. This card will be permanently deleted after 3 days.");
        router.push('/');
      } else if (modalState.action === 'restore') {
        await restoreStory(storyId);
        alert("Restored successfully.");
        router.push('/');
      } else if (modalState.action === 'delete') {
        await deleteStoryPermanently(storyId);
        alert("Permanently deleted.");
        router.push('/archive');
      }
      router.refresh();
      closeModal();
    } catch (error) {
      setErrorMsg(error.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-3">
        {isArchived ? (
          <>
            <button
              onClick={() => openModal('restore')}
              className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background font-bold rounded-full hover:opacity-90 transition-opacity uppercase tracking-[0.1em] text-xs"
            >
              <ArrowUUpLeft size={20} />
              Restore
            </button>
            <button
              onClick={() => openModal('delete')}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-600 dark:text-red-400 font-bold rounded-full hover:bg-red-500/20 transition-colors uppercase tracking-[0.1em] text-xs border border-red-500/20"
            >
              <Trash size={16} weight="bold" />
              Delete Permanently
            </button>
          </>
        ) : (
            <button
              onClick={() => openModal('archive')}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-600 dark:text-red-400 font-bold rounded-full hover:bg-red-500/20 transition-colors uppercase tracking-[0.1em] text-xs border border-red-500/20"
            >
              <Archive size={16} weight="bold" />
              Archive (Delete)
            </button>
        )}
      </div>

      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card-bg w-full max-w-md rounded-3xl p-8 border border-border shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={closeModal} className="absolute top-6 right-6 p-2 rounded-full hover:bg-foreground/5 transition-colors">
              <X size={24} />
            </button>
            
            <h3 className="text-2xl font-bold mb-2">Confirm Action</h3>
            <p className="text-foreground/70 mb-6">
              {modalState.action === 'archive' && "Are you sure you want to move this card to the archive?"}
              {modalState.action === 'restore' && "Do you want to restore this card back to the gallery?"}
              {modalState.action === 'delete' && "This action cannot be undone. Are you sure?"}
            </p>

            <div className="space-y-4">
              {errorMsg && (
                <div className="text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full bg-foreground text-background font-bold tracking-widest uppercase rounded-xl px-4 py-4 mt-4 hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
