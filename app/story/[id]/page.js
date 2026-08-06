import { getStoryById, getStories, getCommentsByStoryId } from '../../lib/data';
import { getSession, getProfiles } from '../../lib/profile';
import Link from 'next/link';
import StoryActions from '../../components/StoryActions';
import MasonryItem from '../../components/MasonryItem';
import ScrollRevealGrid from '../../components/ScrollRevealGrid';
import Image from 'next/image';
import DownloadButton from '../../components/DownloadButton';
import CommentSection from '../../components/CommentSection';

export default async function StoryDetail({ params }) {
  const { id } = await params;
  const story = await getStoryById(id);
  const allStories = await getStories();
  const comments = await getCommentsByStoryId(id);
  const session = await getSession();
  const profiles = await getProfiles();

  if (!story) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Memory not found! 😢</h2>
        <Link 
          href="/" 
          className="bg-foreground text-background px-8 py-4 rounded-full font-semibold hover:-translate-y-[1px] active:scale-[0.98] transition-all shadow-md hover:shadow-lg uppercase tracking-widest text-sm"
        >
          Back to Gallery
        </Link>
      </div>
    );
  }

  const date = new Date(story.created_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const otherStories = allStories.filter(s => s.id !== story.id).slice(0, 4);
  const isVideo = story.image_url && story.image_url.match(/\.(mp4|webm|mov|ogg)(\?.*)?$/i);

  return (
    <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 relative z-10">
      <Link href="/" className="inline-block text-foreground/60 hover:text-foreground font-medium mb-8 transition-colors uppercase tracking-[0.1em] text-xs">
        &larr; Back to Gallery
      </Link>
      
      {/* Editorial Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-24">
        
        {/* Left Side: Fixed Image */}
        <div className="lg:sticky lg:top-24 w-full">
          {story.image_url ? (
             <div className="bg-card-bg/50 backdrop-blur-md rounded-3xl overflow-hidden border border-border/50 shadow-xl w-full aspect-[4/5] relative flex items-center justify-center group">
               {isVideo ? (
                 <video 
                   src={story.image_url} 
                   controls 
                   playsInline
                   className="absolute inset-0 w-full h-full object-cover bg-black" 
                 />
               ) : (
                 <>
                   <Image
                     src={story.image_url} 
                     alt={story.title} 
                     fill
                     sizes="(max-width: 1024px) 100vw, 50vw"
                     quality={90}
                     priority
                     className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                   />
                   <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                 </>
               )}
             </div>
          ) : (
            <div className="bg-card-bg/50 backdrop-blur-md rounded-3xl overflow-hidden border border-border/50 shadow-xl w-full aspect-square flex items-center justify-center p-12">
               <div className="text-6xl font-bold text-foreground/10 uppercase tracking-tighter text-center leading-none">
                 {story.title}
               </div>
            </div>
          )}
        </div>
        
        {/* Right Side: Scrollable Text Content */}
        <div className="py-4 lg:py-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <p className="text-accent font-bold tracking-[0.1em] uppercase text-xs">
              {date}
            </p>
            {story.authorProfile && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Posted by</span>
                <div className="flex items-center gap-2 bg-foreground/5 px-3 py-1.5 rounded-full">
                  <div className="w-5 h-5 rounded-full overflow-hidden shrink-0">
                    {story.authorProfile.avatar_url ? (
                      <img src={story.authorProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-foreground/10 flex items-center justify-center font-bold text-[10px] text-foreground/50">
                        {(story.authorProfile.display_name || story.authorProfile.username || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-foreground/80">{story.authorProfile.display_name || story.authorProfile.username}</span>
                </div>
              </div>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8 leading-[1.1]">{story.title}</h1>
          
          <div className="text-lg md:text-xl text-foreground/80 leading-relaxed whitespace-pre-wrap flex-grow font-medium">
            {story.content}
          </div>
          
          <div className="mt-12 pt-8 border-t border-border/50 flex flex-wrap items-center gap-3">
            {story.image_url && <DownloadButton url={story.image_url} title={story.title} />}
            <StoryActions storyId={story.id} isArchived={story.is_archived} />
          </div>

          <CommentSection storyId={story.id} initialComments={comments} currentUser={session} profiles={profiles} />
        </div>
      </div>

      {/* More Memories Section */}
      {otherStories.length > 0 && (
        <div className="pt-16 border-t border-border/30">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-2xl font-bold tracking-tight uppercase">More Memories</h3>
            <Link href="/" className="text-accent text-sm tracking-wider font-semibold uppercase hover:-translate-y-[1px] transition-transform">
              View All
            </Link>
          </div>
          
          <ScrollRevealGrid className="columns-1 sm:columns-2 lg:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6 pb-12">
            {otherStories.map(s => (
              <MasonryItem key={s.id} story={s} />
            ))}
          </ScrollRevealGrid>
        </div>
      )}
    </div>
  );
}
