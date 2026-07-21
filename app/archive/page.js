import Link from 'next/link';
import { getArchivedStories } from '../data';
import MasonryItem from '../components/MasonryItem';

export const revalidate = 0; // Ensure data is always fresh

export default async function ArchivePage() {
  const stories = await getArchivedStories();

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter mb-2">Archive 🗑️</h2>
          <p className="text-foreground/60">Items here will be automatically deleted after 3 days.</p>
        </div>
        <Link 
          href="/" 
          className="text-foreground/60 hover:text-foreground font-medium transition-colors uppercase tracking-widest text-sm"
        >
          Back to Gallery
        </Link>
      </div>

      {stories.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4 bg-card-bg/50 rounded-3xl border border-border border-dashed mt-8">
          <p className="text-foreground/60 text-lg">
            No archived items.
          </p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 pb-12 mt-8">
          {stories.map(story => (
            <MasonryItem key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
}
