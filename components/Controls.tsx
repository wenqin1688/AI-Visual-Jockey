
import React, { useRef } from 'react';
import { AudioSourceMode } from '../types';
import { Mic, Music, Play, Pause, Image as ImageIcon, Eye, FileText } from 'lucide-react';

interface ControlsProps {
  mode: AudioSourceMode;
  isPlaying: boolean;
  onFileSelect: (file: File) => void;
  onImageSelect: (files: FileList) => void;
  onLyricsSelect: (file: File) => void;
  onMicSelect: () => void;
  onTogglePlay: () => void;
  onToggleView: () => void;
  isAutoRotate: boolean;
  particleSize: number;
  setParticleSize: (size: number) => void;
}

const Controls: React.FC<ControlsProps> = ({ 
  mode, 
  isPlaying, 
  onFileSelect, 
  onImageSelect,
  onLyricsSelect,
  onMicSelect, 
  onTogglePlay,
  onToggleView,
  isAutoRotate,
  particleSize,
  setParticleSize,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const lyricsInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) onFileSelect(e.target.files[0]);
    // Reset value so same file can be selected again
    e.target.value = '';
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) onImageSelect(e.target.files);
    e.target.value = '';
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-8 pt-4 bg-transparent pointer-events-none">
      
      {/* Main Control Dock */}
      <div className="pointer-events-auto flex items-center gap-4 px-8 py-4 rounded-full border border-white/10 bg-black/80 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Playback Button (Center Left) */}
        <button 
          onClick={onTogglePlay}
          disabled={mode !== AudioSourceMode.File}
          className={`w-14 h-14 rounded-full flex items-center justify-center bg-white text-black hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Play/Pause (Space)"
        >
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>

        <div className="w-px h-8 bg-white/10 mx-2"></div>

        {/* Inputs */}
        <div className="flex gap-2">
            <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all" title="Load Audio">
              <Music size={20} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" className="hidden" />

            <button onClick={() => imageInputRef.current?.click()} className="p-3 text-gray-400 hover:text-purple-400 hover:bg-white/10 rounded-full transition-all" title="Upload Images (Multi)">
               <ImageIcon size={20} />
            </button>
            <input type="file" ref={imageInputRef} onChange={handleImageChange} accept="image/*" multiple className="hidden" />

            <button onClick={() => lyricsInputRef.current?.click()} className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all" title="Load .LRC">
                <FileText size={20} />
            </button>
            <input type="file" ref={lyricsInputRef} onChange={(e) => e.target.files && onLyricsSelect(e.target.files[0])} accept=".lrc,.txt" className="hidden" />
        </div>

        <div className="w-px h-8 bg-white/10 mx-2"></div>

        {/* Toggles */}
        <div className="flex gap-2 items-center">
            <button onClick={onToggleView} className={`p-3 rounded-full transition-all ${!isAutoRotate ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`} title="Toggle Rotation">
               <Eye size={20} />
            </button>

            <button onClick={onMicSelect} className={`p-3 rounded-full transition-all ${mode === AudioSourceMode.Microphone ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-gray-400 hover:text-red-400 hover:bg-white/10'}`} title="Mic Input">
               <Mic size={20} />
            </button>
        </div>

        {/* Size Slider */}
        <div className="flex flex-col gap-1 w-20 ml-2 group px-2">
           <div className="flex items-center justify-between text-gray-500 text-[9px] uppercase font-bold group-hover:text-cyan-400 transition-colors">
              <span>Zoom</span>
           </div>
           <input 
             type="range" min="0.5" max="10" step="0.1" 
             value={particleSize}
             onChange={(e) => setParticleSize(parseFloat(e.target.value))}
             className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
           />
        </div>
      </div>
    </div>
  );
};

export default Controls;
