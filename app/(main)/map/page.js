import { getMapPlaces } from '../lib/data';
import DynamicMap from '../components/DynamicMap';
import Link from 'next/link';

export const revalidate = 0;

export default async function MapPage() {
  const places = await getMapPlaces();

  return (
    <div className="w-full relative z-10 flex flex-col h-[calc(100vh-140px)]">
      <div className="flex justify-between items-end mb-6 pb-4 border-b border-border/50 shrink-0">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-2 uppercase">Love Map</h2>
          <p className="text-foreground/70 font-medium tracking-wide">Our favorite places and memories around the world.</p>
        </div>
        <Link 
          href="/" 
          className="text-foreground/60 hover:text-foreground font-medium transition-colors uppercase tracking-[0.1em] text-xs shrink-0 mb-1"
        >
          &larr; Gallery
        </Link>
      </div>

      <div className="flex-1 w-full min-h-[400px] mb-4">
        <DynamicMap places={places} />
      </div>
      
      <div className="shrink-0 text-center text-foreground/50 text-xs uppercase tracking-widest font-medium py-2">
        Click anywhere on the map to add a new place
      </div>
    </div>
  );
}
