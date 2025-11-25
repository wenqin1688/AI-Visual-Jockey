import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageSidebarProps {
  images: string[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

const ImageSidebar: React.FC<ImageSidebarProps> = ({ images, currentIndex, onSelect }) => {
  if (images.length === 0) return null;

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40 group">
      {/* Trigger Area - Left Side */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-48 bg-transparent flex items-center justify-start pl-2 cursor-pointer group-hover:opacity-0 transition-opacity">
         <div className="w-1 h-12 bg-cyan-500/50 rounded-full animate-pulse"></div>
      </div>

      {/* Drawer - Slide from Left */}
      <div className="-translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out bg-black/80 backdrop-blur-xl border-r border-cyan-500/30 p-4 rounded-r-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
         <div className="flex items-center gap-2 text-cyan-400 mb-2 border-b border-white/10 pb-2">
             <ImageIcon size={16} />
             <span className="text-xs font-bold uppercase tracking-widest">Image Queue</span>
         </div>
         
         {images.map((src, idx) => (
             <button 
               key={idx}
               onClick={() => onSelect(idx)}
               className={`relative w-24 h-24 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${idx === currentIndex ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'border-white/10 opacity-60 hover:opacity-100'}`}
             >
                 <img src={src} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                 {idx === currentIndex && (
                     <div className="absolute inset-0 bg-cyan-500/20 animate-pulse"></div>
                 )}
             </button>
         ))}
      </div>
    </div>
  );
};

export default ImageSidebar;