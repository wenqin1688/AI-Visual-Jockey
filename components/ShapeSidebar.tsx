
import React, { useState, useRef, useEffect } from 'react';
import { ShapeType, Preset } from '../types';
import { Box, Circle, Activity, Disc, Triangle, Radio, Sparkles, Zap, Aperture, Layers, Globe, Hexagon, Wind, Grid, Star, Save, Shuffle, ChevronDown, Trash2, Cpu, Check, X } from 'lucide-react';

interface ShapeSidebarProps {
  currentShape: ShapeType | 'AUTO';
  onSelect: (shape: ShapeType | 'AUTO') => void;
  coreIndex: number;
  effectIndex: number;
  setCoreIndex: (idx: number) => void;
  setEffectIndex: (idx: number) => void;
  savedPresets: Preset[];
  onSavePreset: (name: string) => void;
  onLoadPreset: (preset: Preset) => void;
  onDeletePreset: (id: string) => void;
  onRandomize: () => void;
}

const CORE_PRESETS = [
  { name: "HYPER TORNADO", icon: Wind },
  { name: "QUANTUM CUBE", icon: Box },
  { name: "NEURAL SPHERE", icon: Circle },
  { name: "CYBER HEART", icon: Activity },
  { name: "DNA HELIX", icon: Activity },
  { name: "VOID RING", icon: Disc },
  { name: "PYRAMID GATE", icon: Triangle },
  { name: "INFINITY LOOP", icon: Radio },
  { name: "STAR CLUSTER", icon: Sparkles },
  { name: "DIGITAL RAIN", icon: Zap },
  { name: "ATOM CORE", icon: Aperture },
  { name: "GRID PLAINS", icon: Layers },
  { name: "SATURN RINGS", icon: Globe },
  { name: "DATA SPIKE", icon: Hexagon },
  { name: "CROSS FIRE", icon: Activity },
  { name: "FLUID WAVE", icon: Wind },
  { name: "CRYSTAL SHARD", icon: Triangle },
  { name: "WARP TUNNEL", icon: Disc },
  { name: "CHAOS FIELD", icon: Zap },
  { name: "SINGULARITY", icon: Circle }
];

const ATMOSPHERE_PRESETS = [
  "WARP SPEED", "METEOR SHOWER", "SNOW DRIFT", "RISING EMBERS", "LATERAL RUSH",
  "VORTEX SPIN", "IMPLOSION", "EXPLOSION", "STATIC NOISE", "DIGITAL GLITCH",
  "MATRIX RAIN", "PULSE WAVES", "ORBITAL DEBRIS", "SHOCKWAVE", "FOG BANK",
  "SPIRAL OUT", "LIQUID FLOW", "ZERO GRAVITY", "GRID LOCK", "VOID SILENCE"
];

const ShapeSidebar: React.FC<ShapeSidebarProps> = ({ 
  currentShape, 
  onSelect, 
  coreIndex, 
  effectIndex,
  setCoreIndex,
  setEffectIndex,
  savedPresets,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  onRandomize
}) => {
  const [showPresets, setShowPresets] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveName, setSaveName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSaving && inputRef.current) {
        inputRef.current.focus();
    }
  }, [isSaving]);

  const handleStartSave = () => {
      setSaveName(`Combo #${savedPresets.length + 1}`);
      setIsSaving(true);
  };

  const handleConfirmSave = () => {
      if (saveName.trim()) {
          onSavePreset(saveName);
          setIsSaving(false);
          setShowPresets(true); // Show the list to confirm it's there
      }
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-72 z-[150] flex flex-col bg-black/90 backdrop-blur-xl border-l border-white/10 shadow-[-10px_0_30px_rgba(0,0,0,0.8)] pointer-events-auto font-mono">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-black/50 flex justify-between items-center shrink-0">
            <h2 className="text-white text-xs font-bold tracking-[0.2em] flex items-center gap-2">
                <Cpu size={14} className="text-cyan-400" />
                VISUAL MIXER
            </h2>
            <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                 <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse delay-75"></div>
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse delay-150"></div>
            </div>
        </div>

        {/* Action Bar: Auto, Random, Save */}
        <div className="grid grid-cols-3 gap-1 p-2 border-b border-white/10 shrink-0">
             <button
                onClick={() => onSelect('AUTO')}
                className={`py-3 rounded border flex flex-col items-center justify-center gap-1 transition-all ${currentShape === 'AUTO' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-white/5 border-transparent text-gray-500 hover:text-white hover:border-white/20'}`}
                title="Enable AI Auto-Pilot"
            >
                <Sparkles size={14} />
                <span className="text-[8px] font-bold tracking-widest">AI AUTO</span>
            </button>

            <button
                onClick={onRandomize}
                className="py-3 rounded border border-transparent bg-white/5 text-gray-400 hover:text-purple-400 hover:border-purple-500/50 flex flex-col items-center justify-center gap-1 transition-all"
                title="Randomize Combination"
            >
                <Shuffle size={14} />
                <span className="text-[8px] font-bold tracking-widest">EXPLORE</span>
            </button>

            {!isSaving ? (
                <button
                    onClick={handleStartSave}
                    className="py-3 rounded border border-transparent bg-white/5 text-gray-400 hover:text-yellow-400 hover:border-yellow-500/50 flex flex-col items-center justify-center gap-1 transition-all"
                    title="Save Current Combo"
                >
                    <Save size={14} />
                    <span className="text-[8px] font-bold tracking-widest">SAVE</span>
                </button>
            ) : (
                <div className="col-span-1 bg-yellow-500/10 border border-yellow-500/30 rounded flex items-center justify-center">
                    <span className="text-[8px] text-yellow-500 font-bold animate-pulse">SAVING...</span>
                </div>
            )}
        </div>
        
        {/* Inline Save Input */}
        {isSaving && (
            <div className="p-2 border-b border-white/10 bg-yellow-500/5 animate-in slide-in-from-top-2 shrink-0">
                <div className="flex gap-1">
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        className="flex-1 bg-black border border-white/20 rounded px-2 text-[10px] text-white focus:border-yellow-500 focus:outline-none uppercase"
                        placeholder="PRESET NAME"
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirmSave()}
                    />
                    <button onClick={handleConfirmSave} className="p-1 bg-yellow-500/20 text-yellow-500 rounded hover:bg-yellow-500 hover:text-black">
                        <Check size={14} />
                    </button>
                    <button onClick={() => setIsSaving(false)} className="p-1 bg-white/10 text-gray-400 rounded hover:bg-white/20 hover:text-white">
                        <X size={14} />
                    </button>
                </div>
            </div>
        )}

        {/* Presets Dropdown */}
        <div className="px-2 py-2 shrink-0">
            <button 
                onClick={() => setShowPresets(!showPresets)}
                className="w-full flex items-center justify-between px-3 py-2 bg-white/5 border border-white/10 hover:border-white/30 rounded text-gray-300 text-[10px] font-bold tracking-widest"
            >
                <span>SAVED COMBOS ({savedPresets.length})</span>
                <ChevronDown size={12} className={`transition-transform ${showPresets ? 'rotate-180' : ''}`} />
            </button>
            
            {showPresets && (
                <div className="mt-1 bg-black border border-white/10 rounded overflow-hidden max-h-40 overflow-y-auto custom-scrollbar">
                    {savedPresets.length === 0 ? (
                        <div className="p-3 text-[9px] text-gray-600 text-center italic">No saved presets yet.</div>
                    ) : (
                        savedPresets.map((preset) => (
                            <div key={preset.id} className="flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/10 p-2 group">
                                <button 
                                    onClick={() => onLoadPreset(preset)}
                                    className="flex-1 text-left text-[9px] text-gray-300 group-hover:text-cyan-400 truncate mr-2"
                                >
                                    {preset.name}
                                </button>
                                <button onClick={() => onDeletePreset(preset.id)} className="text-gray-600 hover:text-red-500">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>

        {/* Unified Scrollable List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar pb-8">
            
            {/* Section 1: Core */}
            <div>
                <div className="sticky top-0 bg-black/95 z-10 py-1 mb-1 border-b border-cyan-500/30">
                    <h3 className="text-[9px] font-bold text-cyan-500 tracking-widest uppercase pl-2">Core Geometry</h3>
                </div>
                <div className="space-y-1">
                    {CORE_PRESETS.map((preset, idx) => {
                        const Icon = preset.icon;
                        const isActive = coreIndex === idx; 
                        return (
                            <button
                                key={`core-${idx}`}
                                onClick={() => { setCoreIndex(idx); onSelect(ShapeType.VJ_Cosmic); }}
                                className={`w-full text-left px-3 py-2 rounded border flex items-center gap-3 transition-all group relative overflow-hidden ${isActive ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-transparent hover:bg-white/5 text-gray-500 hover:text-gray-300'}`}
                            >
                                <Icon size={14} className={isActive ? 'animate-pulse' : ''} />
                                <span className="text-[10px] font-bold tracking-widest">{preset.name}</span>
                                {isActive && <div className="absolute right-2 w-1.5 h-1.5 bg-cyan-500 rounded-full shadow-[0_0_5px_#06b6d4]"></div>}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Section 2: Atmosphere */}
            <div>
                 <div className="sticky top-0 bg-black/95 z-10 py-1 mb-1 border-b border-purple-500/30">
                    <h3 className="text-[9px] font-bold text-purple-500 tracking-widest uppercase pl-2">Atmosphere FX</h3>
                </div>
                <div className="space-y-1">
                    {ATMOSPHERE_PRESETS.map((name, idx) => {
                        const isActive = effectIndex === idx;
                        return (
                            <button
                                key={`fx-${idx}`}
                                onClick={() => { setEffectIndex(idx); onSelect(ShapeType.VJ_Cosmic); }}
                                className={`w-full text-left px-3 py-2 rounded border flex items-center gap-3 transition-all group relative overflow-hidden ${isActive ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-transparent hover:bg-white/5 text-gray-500 hover:text-gray-300'}`}
                            >
                                <Grid size={14} className={isActive ? 'animate-pulse' : ''} />
                                <span className="text-[10px] font-bold tracking-widest">{name}</span>
                                {isActive && <div className="absolute right-2 w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_5px_#a855f7]"></div>}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
        
        {/* Footer info - Bottom Right Corner */}
        <div className="shrink-0 py-3 px-4 bg-black border-t border-white/10 flex justify-end items-center z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.8)]">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] font-bold text-cyan-500 tracking-[0.2em] uppercase drop-shadow-[0_0_5px_rgba(6,182,212,0.3)] hover:text-cyan-400 transition-colors cursor-default">
                    Wenvis AIMusic LAB
                </span>
             </div>
        </div>
    </div>
  );
};

export default ShapeSidebar;
