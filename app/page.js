import Link from 'next/link';
import { getStories } from './actions';
import MasonryItem from './components/MasonryItem';
import Timeline from './components/Timeline';

export const revalidate = 0; // Ensure data is always fresh (can be optimized later)

export default async function Home() {
  const stories = await getStories();

  return (
    <div className="w-full">
      {stories.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">No memories yet! ✨</h2>
          <p className="text-foreground/60 text-lg mb-8 max-w-[40ch]">
            Start capturing your beautiful moments together. Your Pinterest-style timeline awaits.
          </p>
          <Link 
            href="/create" 
            className="bg-foreground text-background px-8 py-4 rounded-full font-semibold hover:scale-105 active:scale-95 transition-transform shadow-lg"
          >
            + Add Your First Memory
          </Link>
        </div>
      ) : (
        <>
          <Timeline stories={stories} />
          <div className="columns-2 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 pb-12">
            {stories.map(story => (
              <MasonryItem key={story.id} story={story} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
