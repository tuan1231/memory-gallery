import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 max-w-2xl mx-auto mt-16 md:mt-24 relative z-10">
      <div className="w-16 h-16 border border-border flex items-center justify-center mb-8 rotate-45 group">
        <div className="w-2 h-2 bg-accent rounded-full -rotate-45" />
      </div>
      <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 uppercase text-foreground">404</h2>
      <h3 className="text-2xl md:text-4xl font-bold tracking-tight mb-6 uppercase text-foreground/80">Page Not Found</h3>
      <p className="text-foreground/60 text-lg mb-10 max-w-[40ch] leading-relaxed">
        It seems you've wandered into an empty space. This memory doesn't exist yet, or the path was lost.
      </p>
      <Link 
        href="/" 
        className="bg-foreground text-background px-6 py-3 md:px-8 md:py-4 rounded-full font-semibold hover:-translate-y-[1px] active:scale-[0.98] transition-transform text-xs md:text-sm uppercase tracking-widest shadow-sm"
      >
        Back to Gallery
      </Link>
    </div>
  );
}
