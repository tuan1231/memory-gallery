"use client";

import { DownloadSimple } from "@phosphor-icons/react";
import { useState } from "react";

export default function DownloadButton({ url, title }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!url) return;
    try {
      setDownloading(true);
      const response = await fetch(url);
      const blob = await response.blob();
      
      const ext = url.split('.').pop().split('?')[0] || 'jpg';
      const safeTitle = (title || 'memory').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${safeTitle}.${ext}`;

      // Optimized for Mobile: Open native Share dialog (Save to photos, send via messages...)
      if (navigator.canShare) {
        const file = new File([blob], filename, { type: blob.type });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: title,
            text: 'Memory from the Gallery 💗',
            files: [file]
          });
          setDownloading(false);
          return;
        }
      }

      // Fallback for Desktop
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      if (error.name !== 'AbortError') { // Ignore error when user cancels Share
        console.error("Download failed", error);
        alert("Download failed. Please try again!");
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={downloading}
      className="flex items-center gap-2 bg-foreground/10 hover:bg-foreground/20 text-foreground px-5 py-2.5 rounded-full font-bold transition-colors uppercase tracking-[0.1em] text-xs disabled:opacity-50"
    >
      <DownloadSimple size={16} weight="bold" />
      {downloading ? "Downloading..." : "Download"}
    </button>
  );
}
