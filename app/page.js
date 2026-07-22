import Link from 'next/link';
import { getStories } from './data';
import MasonryItem from './components/MasonryItem';
import Timeline from './components/Timeline';
import ScrollRevealGrid from './components/ScrollRevealGrid';

export const revalidate = 0; // Ensure data is always fresh (can be optimized later)

export default async function Home() {
  const stories = await getStories();

  return (
    <div className="w-full">
      {stories.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 max-w-2xl mx-auto mt-16 md:mt-24">
          <div className="w-16 h-16 border border-border flex items-center justify-center mb-8 rotate-45 group">
            <div className="w-2 h-2 bg-accent rounded-full -rotate-45" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6 uppercase">The Canvas is Empty</h2>
          <p className="text-foreground/60 text-lg mb-10 max-w-[40ch] leading-relaxed">
            Every great story starts with a single moment. Capture your first beautiful memory and begin the gallery.
          </p>
          <Link 
            href="/create" 
            className="bg-foreground text-background px-6 py-3 md:px-8 md:py-4 rounded-full font-semibold hover:-translate-y-[1px] active:scale-[0.98] transition-transform text-xs md:text-sm uppercase tracking-widest shadow-sm"
          >
            Add First Memory
          </Link>
        </div>
      ) : (
        <>
          <Timeline stories={stories} />
          <ScrollRevealGrid className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6 pb-12">
            {stories.map(story => (
              <MasonryItem key={story.id} story={story} />
            ))}
          </ScrollRevealGrid>
        </>
      )}
    </div>
  );
}
