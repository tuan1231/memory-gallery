import Link from 'next/link';
import { getStories } from '../lib/data';
import MemoryTimeline from '../components/MemoryTimeline';

export const revalidate = 0; // Ensure data is always fresh

export default async function TimelinePage() {
  const stories = await getStories();

  return (
    <div className="w-full relative z-10">
      <div className="flex justify-between items-end mb-12 border-b border-border/50 pb-8 px-4 sm:px-8">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 uppercase">Timeline</h2>
          <p className="text-foreground/70 font-medium">Your memories organized through time.</p>
        </div>
        <Link 
          href="/" 
          className="text-foreground/60 hover:text-foreground font-medium transition-colors uppercase tracking-[0.1em] text-xs"
        >
          &larr; Back to Gallery
        </Link>
      </div>

      {stories.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4 bg-card-bg/50 backdrop-blur-md rounded-3xl border border-border/50 shadow-sm mt-8 max-w-2xl mx-auto">
          <p className="text-foreground/50 text-lg uppercase tracking-widest font-bold">
            No memories yet
          </p>
        </div>
      ) : (
        <MemoryTimeline stories={stories} />
      )}
    </div>
  );
}
