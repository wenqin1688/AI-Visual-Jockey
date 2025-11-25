
import React, { useState, useEffect, useRef } from 'react';
import Visualizer from './components/Visualizer';
import Controls from './components/Controls';
import LyricsDisplay from './components/LyricsDisplay';
import ProgressBar from './components/ProgressBar';
import ImageSidebar from './components/ImageSidebar';
import ShapeSidebar from './components/ShapeSidebar';
import VJConsole from './components/VJConsole';
import { audioController } from './services/AudioController';
import { parseLrc, LyricLine } from './services/LyricsParser';
import { findLyrics } from './services/LyricsFetcher';
import { analyzeSentiment } from './services/SentimentAnalysis';
import { StorageService } from './services/StorageService';
import { AudioSourceMode, ShapeType, SentimentData, AgentLog, AgentState, Preset } from './types';
import { Upload, Palette, RotateCcw } from 'lucide-react';

const CORE_NAMES = [
  "HYPER TORNADO", "QUANTUM CUBE", "NEURAL SPHERE", "CYBER HEART", "DNA HELIX",
  "VOID RING", "PYRAMID GATE", "INFINITY LOOP", "STAR CLUSTER", "DIGITAL RAIN",
  "ATOM CORE", "GRID PLAINS", "SATURN RINGS", "DATA SPIKE", "CROSS FIRE",
  "FLUID WAVE", "CRYSTAL SHARD", "WARP TUNNEL", "CHAOS FIELD", "SINGULARITY"
];

const FX_NAMES = [
  "WARP SPEED", "METEOR SHOWER", "SNOW DRIFT", "RISING EMBERS", "LATERAL RUSH",
  "VORTEX SPIN", "IMPLOSION", "EXPLOSION", "STATIC NOISE", "DIGITAL GLITCH",
  "MATRIX RAIN", "PULSE WAVES", "ORBITAL DEBRIS", "SHOCKWAVE", "FOG BANK",
  "SPIRAL OUT", "LIQUID FLOW", "ZERO GRAVITY", "GRID LOCK", "VOID SILENCE"
];

const App: React.FC = () => {
  const [mode, setMode] = useState<AudioSourceMode>(AudioSourceMode.None);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [shapeType, setShapeType] = useState<ShapeType>(ShapeType.VJ_Cosmic); 
  const [isAutoFx, setIsAutoFx] = useState(true); 
  
  const [coreShapeIndex, setCoreShapeIndex] = useState(0);
  const [effectIndex, setEffectIndex] = useState(0);

  const [manualColor, setManualColor] = useState<string | null>(null);
  const [fps, setFps] = useState(0);
  const [particleSize, setParticleSize] = useState(3);
  const [energyMood, setEnergyMood] = useState("NEUTRAL");
  
  const [isUIVisible, setIsUIVisible] = useState(true);
  const hideUITimerRef = useRef<number | null>(null);

  const [imageList, setImageList] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [currentLyric, setCurrentLyric] = useState<string>("");
  const [lyricStatus, setLyricStatus] = useState<string>("");

  const [currentSentiment, setCurrentSentiment] = useState<SentimentData | null>(null);
  
  // VJ AGENT STATE
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [agentState, setAgentState] = useState<AgentState>({
      level: 1,
      xp: 0,
      nextLevelXp: 1000,
      status: 'IDLE'
  });
  const [savedPresets, setSavedPresets] = useState<Preset[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const lastAutoChangeRef = useRef<number>(0);
  const visualHistoryRef = useRef<string[]>([]);
  const thoughtLoopRef = useRef<number>(0);

  // --- LOGGING UTILS ---
  const addLog = (type: AgentLog['type'], message: string) => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
      const newLog: AgentLog = { id: Math.random().toString(36), timestamp: timeStr, type, message };
      setAgentLogs(prev => [...prev.slice(-40), newLog]); // Keep last 40
  };

  const gainXp = (amount: number) => {
      setAgentState(prev => {
          let newXp = prev.xp + amount;
          let newLevel = prev.level;
          let nextXp = prev.nextLevelXp;
          
          if (newXp >= nextXp) {
              newLevel++;
              newXp = newXp - nextXp;
              nextXp = Math.floor(nextXp * 1.5);
              addLog('EVOLUTION', `AGENT LEVEL UP! NOW LEVEL ${newLevel}`);
              addLog('INFO', `PROCESSING POWER INCREASED (Simulated)`);
          }
          const newState = { ...prev, xp: newXp, level: newLevel, nextLevelXp: nextXp };
          StorageService.saveAgentState(newState); // Persist State
          return newState;
      });
  };

  // --- INITIALIZATION ---
  useEffect(() => {
     addLog('INFO', 'SYSTEM INITIALIZED');
     addLog('INFO', 'CONNECTING TO LOCAL DATABASE...');
     
     // Load Presets
     const dbPresets = StorageService.getPresets();
     setSavedPresets(dbPresets);
     addLog('INFO', `DB SYNCED: ${dbPresets.length} PRESETS FOUND`);

     // Load Agent State
     const dbAgent = StorageService.getAgentState();
     if (dbAgent) {
         setAgentState(dbAgent);
         addLog('INFO', `AGENT MEMORY RESTORED (LVL ${dbAgent.level})`);
     } else {
         addLog('INFO', 'NEW AGENT INSTANCE CREATED');
     }
     
     addLog('INFO', 'VJ AGENT ONLINE');

     // Start "Stream of Consciousness" - The Agent "Thinks" even when idle
     thoughtLoopRef.current = window.setInterval(() => {
         // Randomly trigger a thought, but also based on current state
         if (Math.random() > 0.6) {
             const thoughts = [
                 "Scanning audio buffer for anomalies...",
                 "Optimizing particle trajectory...",
                 "Calibrating visual aesthetic weights...",
                 "Monitoring GPU frame timing...",
                 "Reviewing recent composition history...",
                 "Hypothesis: User prefers higher contrast.",
                 "Memory integrity check: PASSED.",
                 "Updating neural weights for rhythm detection...",
                 "Syncing to database..."
             ];
             
             // Contextual thoughts
             if (energyMood === 'CHAOS') thoughts.push("Energy levels CRITICAL. Stabilizing core.");
             if (energyMood === 'NEUTRAL') thoughts.push("Awaiting energy spike...");
             if (fps < 30) thoughts.push("Performance dip detected. Adjusting LOD.");

             const t = thoughts[Math.floor(Math.random() * thoughts.length)];
             addLog('INFO', `INTERNAL: ${t}`);
         }
     }, 6000); // Thoughts occur every 6s on average

     return () => clearInterval(thoughtLoopRef.current);
  }, [energyMood, fps]);

  // --- INPUT HANDLERS ---

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
             if (mode === AudioSourceMode.File) {
                e.preventDefault();
                handleTogglePlay();
             }
        }
        resetTimer();
    };

    const resetTimer = () => {
      setIsUIVisible(true);
      if (hideUITimerRef.current) clearTimeout(hideUITimerRef.current);
      hideUITimerRef.current = window.setTimeout(() => setIsUIVisible(false), 3000) as unknown as number;
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('keydown', handleKeyDown);
    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('keydown', handleKeyDown);
      if (hideUITimerRef.current) clearTimeout(hideUITimerRef.current);
    };
  }, [mode, isPlaying]);

  useEffect(() => {
    if (shapeType === ShapeType.Image && imageList.length > 1) {
        const interval = window.setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % imageList.length);
            addLog('DECISION', "AUTO_CYCLE: NEXT_IMAGE");
        }, 10000); 
        return () => window.clearInterval(interval);
    }
  }, [shapeType, imageList.length]);

  // --- INTELLIGENT AUTO SWITCH LOGIC ---
  useEffect(() => {
      if (isAutoFx && isPlaying) {
          if (Math.random() > 0.98) gainXp(5);
          setAgentState(prev => ({...prev, status: 'ANALYZING'}));

          const now = Date.now();
          // Adjust switching speed based on mood
          const switchDelay = energyMood === 'CHAOS' ? 2000 : energyMood === 'HIGH' ? 4000 : 8000;

          if (now - lastAutoChangeRef.current > switchDelay) {
              if (shapeType !== ShapeType.Image) {
                  // INTELLIGENT SELECTION ALGORITHM
                  let candidates = Array.from({length: 20}, (_, i) => i);
                  
                  // Filter out recent history
                  const recent = visualHistoryRef.current.slice(-5);
                  candidates = candidates.filter(c => !recent.includes(c.toString()));
                  
                  if (candidates.length === 0) candidates = [Math.floor(Math.random()*20)]; // Fallback
                  
                  // Calculate "Fit Score" based on Agent Logic (Simulated)
                  const nextCore = candidates[Math.floor(Math.random() * candidates.length)];
                  
                  visualHistoryRef.current = [...visualHistoryRef.current, nextCore.toString()].slice(-10);
                  
                  setCoreShapeIndex(nextCore);
                  addLog('DECISION', `OPTIMIZING GEOMETRY -> ${CORE_NAMES[nextCore]} (Fit Score: ${(Math.random()*0.5 + 0.5).toFixed(2)})`);
                  gainXp(15); 
              }
              
              if (Math.random() > 0.3) {
                 const nextFx = Math.floor(Math.random() * 20);
                 setEffectIndex(nextFx);
                 addLog('DECISION', `ATMOSPHERE SHIFT -> ${FX_NAMES[nextFx]}`);
              }
              lastAutoChangeRef.current = now;
          }
      } else if (!isPlaying) {
          setAgentState(prev => ({...prev, status: 'IDLE'}));
      }
  }, [isAutoFx, isPlaying, energyMood, shapeType, coreShapeIndex, effectIndex]);

  // MOOD LOGGER
  useEffect(() => {
     if (isPlaying) {
         addLog('ANALYSIS', `DETECTED MOOD SHIFT: ${energyMood}`);
     }
  }, [energyMood]);

  useEffect(() => {
    if (lyrics.length > 0) {
        const activeLine = lyrics.reduce((prev, curr) => {
            return (curr.time <= currentTime) ? curr : prev;
        }, { time: 0, text: "" } as LyricLine);
        
        if (activeLine.text !== currentLyric) {
            setCurrentLyric(activeLine.text);
            if (activeLine.text) {
                const sentiment = analyzeSentiment(activeLine.text);
                setCurrentSentiment(sentiment);
                if (sentiment.description !== "NEUTRAL") {
                    addLog('ANALYSIS', `LYRIC SENTIMENT: ${sentiment.description}`);
                }
            }
        }
    }
  }, [currentTime, lyrics, currentLyric]);

  // --- PRESET LOGIC ---
  const handleSavePreset = (name: string) => {
      // Must pause auto to save exact state
      setIsAutoFx(false);
      
      const newPreset: Preset = {
          id: Math.random().toString(36).substr(2,9),
          name: name,
          coreIndex: coreShapeIndex,
          effectIndex: effectIndex,
          color: manualColor,
          timestamp: Date.now()
      };
      
      // Persist to DB
      const updated = StorageService.savePreset(newPreset);
      setSavedPresets(updated);
      
      addLog('INFO', `PRESET SAVED TO DATABASE: "${name}"`);
  };

  const handleLoadPreset = (preset: Preset) => {
      setCoreShapeIndex(preset.coreIndex);
      setEffectIndex(preset.effectIndex);
      if (preset.color) setManualColor(preset.color);
      setIsAutoFx(false);
      addLog('DECISION', `PRESET LOADED: ${preset.name}`);
  };

  const handleDeletePreset = (id: string) => {
      const updated = StorageService.deletePreset(id);
      setSavedPresets(updated);
      addLog('INFO', `PRESET DELETED FROM DB`);
  };

  const handleRandomize = () => {
      const c = Math.floor(Math.random() * 20);
      const e = Math.floor(Math.random() * 20);
      setCoreShapeIndex(c);
      setEffectIndex(e);
      setIsAutoFx(false);
      addLog('DECISION', `EXPLORATION: ${CORE_NAMES[c]} + ${FX_NAMES[e]}`);
  };

  // --- FILE HANDLING ---

  const handleFileSelect = async (file: File) => {
    // 1. Reset current state
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
    }
    audioController.disconnectCurrentSource();
    setIsPlaying(false);
    setLyrics([]);
    setCurrentLyric("");
    setLyricStatus("INITIALIZING...");
    setCurrentTime(0);
    setDuration(0);

    // 2. Initialize new audio
    const newAudio = new Audio();
    newAudio.crossOrigin = "anonymous";
    const url = URL.createObjectURL(file);
    newAudio.src = url;

    newAudio.addEventListener('ended', () => setIsPlaying(false));
    newAudio.addEventListener('play', () => { setIsPlaying(true); setAgentState(prev => ({...prev, status: 'LISTENING'})); addLog('INFO', "AUDIO_ENGINE START"); });
    newAudio.addEventListener('pause', () => setIsPlaying(false));
    newAudio.addEventListener('loadedmetadata', () => setDuration(newAudio.duration));
    newAudio.addEventListener('timeupdate', () => setCurrentTime(newAudio.currentTime));
    
    audioRef.current = newAudio;
    setCurrentFileName(file.name.replace(/\.[^/.]+$/, "")); 
    setMode(AudioSourceMode.File);
    addLog('INFO', `TRACK LOADED: ${file.name.substring(0, 20)}...`);
    
    audioController.connectAudioElement(newAudio);
    
    try {
        await newAudio.play();
        setIsPlaying(true);
    } catch (err) {
        console.error("Auto-play failed", err);
        setIsPlaying(false);
        addLog('ERROR', "AUTO_PLAY_BLOCKED");
    }

    // 3. Fetch Lyrics
    setLyricStatus("SCANNING LYRICS...");
    addLog('INFO', "FETCHING METADATA...");
    
    try {
        const lrcContent = await findLyrics(file.name);
        if (lrcContent) {
            setLyrics(parseLrc(lrcContent));
            setLyricStatus(""); 
            addLog('INFO', "LYRICS SYNCHRONIZED");
        } else {
            setLyricStatus("");
            addLog('INFO', "LYRICS NOT FOUND");
        }
    } catch (e) {
        setLyricStatus("");
    }
  };

  const handleLyricsSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
            setLyrics(parseLrc(e.target.result));
            addLog('INFO', "MANUAL LRC IMPORTED");
        }
    };
    reader.readAsText(file);
  };

  const handleImageSelect = (files: FileList) => {
    const urls: string[] = [];
    let loadedCount = 0;
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (typeof e.target?.result === 'string') {
                urls.push(e.target.result);
                loadedCount++;
                if (loadedCount === files.length) {
                    setImageList(prev => [...prev, ...urls]);
                    setCurrentImageIndex(0);
                    setShapeType(ShapeType.Image);
                    setIsAutoFx(false);
                    addLog('INFO', `${files.length} IMAGE TARGETS ACQUIRED`);
                }
            }
        };
        reader.readAsDataURL(file);
    });
  };

  const handleMicSelect = async () => {
    try {
      if (audioRef.current) audioRef.current.pause();
      await audioController.connectMicrophone();
      setMode(AudioSourceMode.Microphone);
      setIsPlaying(true);
      addLog('INFO', "MICROPHONE INPUT ACTIVE");
    } catch (err) { console.error(err); addLog('ERROR', "MIC_ACCESS_DENIED"); }
  };

  const handleTogglePlay = async () => {
    if (mode === AudioSourceMode.File && audioRef.current) {
      await audioController.resumeContext();
      if (audioRef.current.paused) {
          audioRef.current.play();
      } else {
          audioRef.current.pause();
      }
    }
  };

  const handleReplay = () => {
      if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
          addLog('INFO', "REPLAY_REQUESTED");
      }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    }
  };

  const handleSidebarSelect = (idx: number) => {
      setCurrentImageIndex(idx);
      setShapeType(ShapeType.Image);
      setIsAutoFx(false);
  };

  const handleShapeSelect = (type: ShapeType | 'AUTO') => {
      if (type === 'AUTO') {
          setIsAutoFx(true);
          if (shapeType === ShapeType.Image) setShapeType(ShapeType.VJ_Cosmic);
          addLog('DECISION', "AUTO_PILOT ENGAGED");
      } else {
          setIsAutoFx(false);
          setShapeType(type);
          addLog('DECISION', "MANUAL_OVERRIDE");
      }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-cyan-400 font-mono select-none">
      
      <Visualizer 
        isPlaying={isPlaying} 
        shapeType={shapeType} 
        setFps={setFps} 
        particleSize={particleSize}
        imageSrc={imageList[currentImageIndex] || null}
        isAutoRotate={isAutoRotate}
        sentiment={currentSentiment}
        manualColor={manualColor}
        setEnergyMood={setEnergyMood}
        coreShapeIndex={coreShapeIndex}
        effectIndex={effectIndex}
      />

      {mode === AudioSourceMode.None && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-1000">
           <div className="flex flex-col items-center gap-8 group">
              <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full animate-pulse"></div>
                  <h1 className="relative text-8xl font-thin tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                    Wenvis AIMusic LAB
                  </h1>
              </div>
              <label className="cursor-pointer group relative">
                  <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl scale-0 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative px-12 py-4 border border-cyan-500/30 bg-black/50 hover:bg-cyan-500 text-cyan-400 hover:text-black rounded-full transition-all duration-300 flex items-center gap-3 tracking-[0.2em] text-xs font-bold uppercase">
                     <Upload size={16} />
                     <span>Initialize System</span>
                  </div>
                  <input type="file" onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])} accept="audio/*" className="hidden" />
              </label>
           </div>
        </div>
      )}

      <div className={`transition-all duration-700 ease-in-out ${mode !== AudioSourceMode.None && isUIVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        
        {/* VJ BRAIN CONSOLE (Left) */}
        <VJConsole 
            logs={agentLogs} 
            state={agentState} 
            isVisible={true} 
            currentCore={CORE_NAMES[coreShapeIndex]}
            currentFx={FX_NAMES[effectIndex]}
            currentMood={energyMood}
            fps={fps}
        />

        <ImageSidebar images={imageList} currentIndex={currentImageIndex} onSelect={handleSidebarSelect} />
        
        {/* RIGHT SIDEBAR LIST */}
        <ShapeSidebar 
            currentShape={isAutoFx ? 'AUTO' : shapeType} 
            onSelect={handleShapeSelect} 
            coreIndex={coreShapeIndex}
            effectIndex={effectIndex}
            setCoreIndex={(idx) => { setCoreShapeIndex(idx); setIsAutoFx(false); addLog('DECISION', `MANUAL_CORE: ${CORE_NAMES[idx]}`); }}
            setEffectIndex={(idx) => { setEffectIndex(idx); setIsAutoFx(false); addLog('DECISION', `MANUAL_FX: ${FX_NAMES[idx]}`); }}
            savedPresets={savedPresets}
            onSavePreset={handleSavePreset}
            onLoadPreset={handleLoadPreset}
            onDeletePreset={handleDeletePreset}
            onRandomize={handleRandomize}
        />

        {/* Top Header & Re-upload */}
        <div className="absolute top-0 left-0 right-0 p-8 flex justify-center items-start z-50 pointer-events-auto">
            <div className="text-center pointer-events-none">
                <h2 className="text-sm font-bold tracking-[0.3em] text-white uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    {currentFileName || "IDLE"}
                </h2>
                <div className="w-12 h-px bg-cyan-500/50 mx-auto mt-2"></div>
            </div>

            {/* TOP RIGHT CONTROLS */}
            <div className="absolute right-72 top-8 flex items-center gap-2 pointer-events-auto"> 
                {mode !== AudioSourceMode.None && (
                     <label className="cursor-pointer w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all text-gray-400 mr-2" title="Upload New Track">
                        <Upload size={14} />
                        <input type="file" onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])} accept="audio/*" className="hidden" />
                     </label>
                )}

                <button 
                  onClick={handleReplay} 
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all text-gray-400 mr-2"
                  title="Replay Audio"
                >
                    <RotateCcw size={14} />
                </button>

                <span className="text-[9px] uppercase tracking-widest text-gray-500">COLOR</span>
                <button onClick={() => colorInputRef.current?.click()} className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all">
                    <Palette size={14} style={{ color: manualColor || '#fff' }} />
                </button>
                <input ref={colorInputRef} type="color" onChange={(e) => setManualColor(e.target.value)} className="absolute opacity-0 w-8 h-8 cursor-pointer right-0" />
            </div>
        </div>

        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[120] pointer-events-auto">
             <Controls 
              mode={mode}
              isPlaying={isPlaying}
              onFileSelect={handleFileSelect}
              onImageSelect={handleImageSelect}
              onLyricsSelect={handleLyricsSelect}
              onMicSelect={handleMicSelect}
              onTogglePlay={handleTogglePlay}
              onToggleView={() => setIsAutoRotate(!isAutoRotate)}
              isAutoRotate={isAutoRotate}
              particleSize={particleSize}
              setParticleSize={setParticleSize}
            />
        </div>

      </div>

      <LyricsDisplay text={currentLyric || lyricStatus} isVisible={mode === AudioSourceMode.File || !!lyricStatus} />

      {mode === AudioSourceMode.File && (
         <div className={`fixed bottom-0 left-0 right-0 z-[100] pointer-events-auto transition-opacity duration-700 ${isUIVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <ProgressBar 
                currentTime={currentTime} 
                duration={duration} 
                onSeek={handleSeek} 
                color={manualColor || undefined}
            />
         </div>
      )}
    </div>
  );
};

export default App;
