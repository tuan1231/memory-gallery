"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createStory } from '../../lib/actions';
import Link from 'next/link';
import { motion } from 'motion/react';
import imageCompression from 'browser-image-compression';
import InteractiveCat from '../../components/InteractiveCat';

export default function CreatePage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const router = useRouter();
  const formRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData(formRef.current);
      
      const imageFile = formData.get('image');
      if (imageFile && imageFile.size > 0) {
        if (imageFile.type.startsWith('image/')) {
          const options = {
            maxSizeMB: 5,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: 'image/jpeg',
          };
          const compressedBlob = await imageCompression(imageFile, options);
          const compressedFile = new File([compressedBlob], imageFile.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          formData.set('image', compressedFile);
        }
      }

      const newStoryId = await createStory(formData);
      router.push(`/story/${newStoryId}`);
    } catch (err) {
      setError(err.message || 'An error occurred while saving the memory.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files[0];
    if (!file) {
      setFileName('');
      return;
    }
    
    if (file.size > 20 * 1024 * 1024) {
      setError('File too large. Please select a file under 20MB.');
      e.target.value = '';
      setFileName('');
      return;
    }

    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 10) {
          setError('Video too long. Please select a video under 10 seconds.');
          e.target.value = '';
          setFileName('');
        } else {
          setFileName(file.name);
        }
      };
      video.src = URL.createObjectURL(file);
    } else {
      setFileName(file.name);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 md:py-16 px-4 relative z-10">
      <Link href="/" className="inline-block text-foreground/60 hover:text-foreground font-medium mb-16 transition-colors uppercase tracking-[0.1em] text-xs">
        &larr; Back to Gallery
      </Link>
      
      <div className="relative mt-8">
        {/* Cat resting on top of the card */}
        <div className="absolute -top-[72px] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <InteractiveCat />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card-bg/90 backdrop-blur-xl border border-border/60 rounded-3xl p-6 md:p-12 shadow-2xl relative z-10"
        >
          <div className="mb-10 text-center mt-4">
            <h1 className="text-3xl font-bold tracking-widest uppercase text-foreground mb-2">New Memory</h1>
            <p className="text-foreground/60 text-sm tracking-wide">Capture a moment to add to your timeline.</p>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-8 flex items-center gap-2">
              <span className="font-medium text-sm">{error}</span>
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground/80 uppercase tracking-[0.1em]" htmlFor="title">
                Memory Title
              </label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                className="w-full bg-background/50 backdrop-blur-sm border border-border rounded-xl px-4 py-3 md:py-4 text-base focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow" 
                placeholder="e.g. Unforgettable trip to Paris..." 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground/80 uppercase tracking-[0.1em]" htmlFor="image">
                Photo / Video (Optional)
              </label>
              <div className="relative">
                <input 
                  type="file" 
                  id="image" 
                  name="image" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  accept="image/*,video/*" 
                  onChange={handleFileChange}
                />
                <div className="w-full bg-background/50 backdrop-blur-sm border border-dashed border-border rounded-xl px-4 py-8 flex flex-col items-center justify-center gap-2 group hover:border-accent/50 transition-colors">
                  <span className="text-foreground/60 font-medium tracking-wide text-sm text-center">
                    {fileName ? fileName : 'Click to upload or drag and drop'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground/80 uppercase tracking-[0.1em]" htmlFor="content">
                The Story
              </label>
              <textarea 
                id="content" 
                name="content" 
                className="w-full bg-background/50 backdrop-blur-sm border border-border rounded-xl px-4 py-3 md:py-4 text-base min-h-[140px] focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow resize-y" 
                placeholder="Tell the story behind this memory..." 
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="w-full bg-foreground text-background font-bold tracking-[0.1em] text-sm uppercase rounded-xl px-4 py-4 mt-8 hover:-translate-y-[1px] active:scale-[0.98] shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center" 
              disabled={loading}
            >
              {loading ? (
                <span className="animate-pulse">Saving...</span>
              ) : (
                <span>Save Memory</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
