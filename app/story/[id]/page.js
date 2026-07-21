import { getStoryById } from '../../actions';
import Link from 'next/link';

export default async function StoryDetail({ params }) {
  const { id } = await params;
  const story = await getStoryById(id);

  if (!story) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Memory not found! 😢</h2>
        <Link 
          href="/" 
          className="bg-foreground text-background px-8 py-4 rounded-full font-semibold hover:scale-105 active:scale-95 transition-transform uppercase tracking-widest text-sm"
        >
          Back to Gallery
        </Link>
      </div>
    );
  }

  const date = new Date(story.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Link href="/" className="inline-block text-foreground/60 hover:text-foreground font-medium mb-12 transition-colors uppercase tracking-widest text-sm">
        Back to Gallery
      </Link>
      
      <div className="bg-card-bg rounded-3xl overflow-hidden border border-border shadow-sm mb-12">
        <div className="w-full h-auto bg-black/5">
          <img 
            src={story.imageUrl} 
            alt={story.title} 
            className="w-full h-auto object-contain max-h-[70vh]" 
          />
        </div>
        
        <div className="p-8 md:p-12">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{story.title}</h1>
          <p className="text-accent font-medium mb-8 pb-8 border-b border-border tracking-wider uppercase text-sm">
            {date}
          </p>
          <div className="text-lg text-foreground/80 leading-relaxed whitespace-pre-wrap max-w-none">
            {story.content}
          </div>
        </div>
      </div>
    </div>
  );
}
