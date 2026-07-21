"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createStory } from '../actions';
import Link from 'next/link';
import { motion } from 'motion/react';
import imageCompression from 'browser-image-compression';
import { Eye, EyeSlash } from '@phosphor-icons/react';

export default function CreatePage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        setLoading(true); // Optional: ensure loading state is maintained during compression
        const options = {
          maxSizeMB: 5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/jpeg',
        };
        const compressedBlob = await imageCompression(imageFile, options);
        // Create a new File object from the Blob
        const compressedFile = new File([compressedBlob], imageFile.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        formData.set('image', compressedFile);
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
    const file = e.target.files[0];
    if (file) setFileName(file.name);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Link href="/" className="inline-block text-foreground/60 hover:text-foreground font-medium mb-12 transition-colors uppercase tracking-widest text-sm">
        Back to Gallery
      </Link>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card-bg border border-border rounded-3xl p-8 md:p-12 shadow-sm"
      >
        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-widest uppercase">New Memory</h1>
        </div>
        <p className="text-foreground/60 mb-10">Capture a new moment to add to your timeline.</p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-8 flex items-center gap-2">
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground/80 uppercase tracking-wider" htmlFor="title">
              Memory Title
            </label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow" 
              placeholder="e.g. Unforgettable trip to Paris..." 
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground/80 uppercase tracking-wider" htmlFor="image">
              Photo (Optional)
            </label>
            <div className="relative">
              <input 
                type="file" 
                id="image" 
                name="image" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                accept="image/*" 
                onChange={handleFileChange}
              />
              <div className="w-full bg-background border border-dashed border-border rounded-xl px-4 py-8 flex flex-col items-center justify-center gap-2 group hover:border-accent/50 transition-colors">
                <span className="text-foreground/60 font-medium tracking-wide">
                  {fileName ? fileName : 'Click to upload or drag and drop'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground/80 uppercase tracking-wider" htmlFor="content">
              The Story
            </label>
            <textarea 
              id="content" 
              name="content" 
              className="w-full bg-background border border-border rounded-xl px-4 py-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow resize-y" 
              placeholder="Tell the story behind this memory..." 
              required
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground/80 uppercase tracking-wider" htmlFor="password">
              Secret Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                name="password" 
                className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow" 
                placeholder="Enter the secret password to save..." 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeSlash size={24} /> : <Eye size={24} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-foreground text-background font-bold tracking-widest uppercase rounded-xl px-4 py-4 mt-4 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center" 
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
  );
}
