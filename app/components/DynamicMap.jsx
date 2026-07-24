"use client";

import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-card-bg/50 backdrop-blur-md rounded-3xl border border-border/50">
      <div className="w-8 h-8 border-4 border-foreground border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-bold tracking-widest uppercase text-sm">Loading Map...</p>
    </div>
  )
});

export default function DynamicMap({ places }) {
  return <MapComponent places={places} />;
}
