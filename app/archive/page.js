import Link from 'next/link';
import { getArchivedStories } from '../data';
import MasonryItem from '../components/MasonryItem';
import ScrollRevealGrid from '../components/ScrollRevealGrid';

export const revalidate = 0; // Ensure data is always fresh

export default async function ArchivePage() {
  const stories = await getArchivedStories();

  return (
    <div className="w-full relative z-10">
      <div className="flex justify-between items-end mb-8 border-b border-border/50 pb-8">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 uppercase">Archive</h2>
          <p className="text-foreground/70 font-medium">Items here will be automatically deleted after 3 days.</p>
        </div>
        <Link 
          href="/" 
          className="text-foreground/60 hover:text-foreground font-medium transition-colors uppercase tracking-[0.1em] text-xs"
        >
          &larr; Back to Gallery
        </Link>
      </div>

      {stories.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4 bg-card-bg/50 backdrop-blur-md rounded-3xl border border-border/50 shadow-sm mt-8">
          <p className="text-foreground/50 text-lg uppercase tracking-widest font-bold">
            No archived items
          </p>
        </div>
      ) : (
        <ScrollRevealGrid className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6 pb-12 mt-12">
          {stories.map(story => (
            <MasonryItem key={story.id} story={story} />
          ))}
        </ScrollRevealGrid>
      )}
    </div>
  );
}
