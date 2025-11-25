
import React, { useEffect, useRef, useState } from 'react';
import { AgentLog, AgentState } from '../types';
import { BrainCircuit, ChevronDown, ChevronUp, Terminal, Zap, Activity, Download, Layers } from 'lucide-react';

interface VJConsoleProps {
  logs: AgentLog[];
  state: AgentState;
  isVisible: boolean;
  currentCore: string;
  currentFx: string;
  currentMood: string;
  fps: number;
}

const VJConsole: React.FC<VJConsoleProps> = ({ logs, state, isVisible, currentCore, currentFx, currentMood, fps }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'LOGS' | 'DATA'>('LOGS');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    if (scrollRef.current && isExpanded && activeTab === 'LOGS') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isExpanded, activeTab]);

  const handleExportMindMap = () => {
      const title = `# VJ AGENT MIND MAP - SESSION REPORT\n`;
      const root = `- WENVIS AGENT (Level ${state.level})\n`;
      const stats = `  - Status: ${state.status}\n  - XP: ${Math.floor(state.xp)}/${state.nextLevelXp}\n`;
      
      let decisions = `  - DECISION TREE\n`;
      const decisionLogs = logs.filter(l => l.type === 'DECISION');
      decisionLogs.forEach(l => {
          decisions += `    - [${l.timestamp}] ${l.message}\n`;
      });

      let analysis = `  - ANALYSIS STREAM\n`;
      const analysisLogs = logs.filter(l => l.type === 'ANALYSIS');
      analysisLogs.forEach(l => {
          analysis += `    - [${l.timestamp}] ${l.message}\n`;
      });

      const content = title + root + stats + decisions + analysis;
      
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vj_agent_mindmap_${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 left-4 z-[130] transition-all duration-500 font-mono ${isExpanded ? 'w-80' : 'w-56'}`}>
      
      {/* Header / Status Bar */}
      <div 
        className="bg-black/90 border border-cyan-500/50 rounded-t-lg p-3 flex items-center justify-between backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.3)]"
      >
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="relative">
                <BrainCircuit size={16} className={`text-cyan-400 ${state.status === 'ANALYZING' || state.status === 'LISTENING' ? 'animate-pulse' : ''}`} />
                {state.status === 'EVOLVING' && <span className="absolute -top-1 -right-1 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span></span>}
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-cyan-400 leading-none">VJ AGENT V2.1</span>
                <span className="text-[8px] text-gray-400 leading-none mt-1">{state.status}</span>
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={handleExportMindMap} className="text-gray-400 hover:text-white" title="Export Mind Map">
                <Download size={12} />
            </button>
            <button onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
            </button>
        </div>
      </div>

      {/* Evolution Bar */}
      <div className="bg-black/90 border-x border-cyan-500/50 px-3 py-1">
         <div className="flex justify-between text-[9px] text-cyan-300 mb-1">
            <span>LVL.{state.level}</span>
            <span>{Math.floor(state.xp)}/{state.nextLevelXp} XP</span>
         </div>
         <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500"
                style={{ width: `${(state.xp / state.nextLevelXp) * 100}%` }}
            ></div>
         </div>
      </div>

      {/* Tabs */}
      {isExpanded && (
          <div className="flex bg-black border-x border-cyan-500/50">
              <button 
                onClick={() => setActiveTab('LOGS')}
                className={`flex-1 py-1 text-[9px] font-bold border-b-2 transition-colors ${activeTab === 'LOGS' ? 'border-cyan-500 text-cyan-400 bg-cyan-900/20' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
              >
                  CHAIN OF THOUGHT
              </button>
              <button 
                onClick={() => setActiveTab('DATA')}
                className={`flex-1 py-1 text-[9px] font-bold border-b-2 transition-colors ${activeTab === 'DATA' ? 'border-purple-500 text-purple-400 bg-purple-900/20' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
              >
                  VISUAL TELEMETRY
              </button>
          </div>
      )}

      {/* Content Area */}
      {isExpanded && (
        <div 
            ref={scrollRef}
            className="h-64 bg-black/80 border border-t-0 border-cyan-500/50 rounded-b-lg p-3 overflow-y-auto custom-scrollbar flex flex-col gap-1.5"
        >
            {activeTab === 'LOGS' ? (
                <>
                    {logs.length === 0 && <span className="text-[9px] text-gray-600 italic">Waiting for input stream...</span>}
                    {logs.map((log) => (
                        <div key={log.id} className="flex gap-2 text-[9px] animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className="text-gray-600 font-bold shrink-0">[{log.timestamp}]</span>
                            <span className={`${
                                log.type === 'DECISION' ? 'text-yellow-400' :
                                log.type === 'ANALYSIS' ? 'text-cyan-300' :
                                log.type === 'EVOLUTION' ? 'text-purple-400 font-bold' :
                                log.type === 'ERROR' ? 'text-red-500' :
                                'text-gray-400'
                            }`}>
                                {log.type === 'DECISION' && '> '}
                                {log.message}
                            </span>
                        </div>
                    ))}
                    <div className="w-2 h-3 bg-cyan-500/50 animate-pulse mt-1"></div>
                </>
            ) : (
                <div className="flex flex-col gap-3 text-[10px] text-gray-300">
                     <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-white border-b border-white/20 pb-1 mb-1">COMPOSITION MATRIX</span>
                        <div className="flex justify-between">
                            <span className="text-gray-500">CORE GEOMETRY</span>
                            <span className="text-cyan-400 font-bold">{currentCore}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">ATMOSPHERE</span>
                            <span className="text-purple-400 font-bold">{currentFx}</span>
                        </div>
                     </div>

                     <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-white border-b border-white/20 pb-1 mb-1">PHYSICS ENGINE</span>
                         <div className="flex justify-between">
                            <span className="text-gray-500">RENDER FPS</span>
                            <span className={`${fps > 55 ? 'text-green-400' : 'text-yellow-400'}`}>{fps}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">PARTICLE COUNT</span>
                            <span>100,000</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-gray-500">CURRENT MOOD</span>
                            <span className={currentMood === 'CHAOS' ? 'text-red-500 animate-pulse font-bold' : 'text-white'}>{currentMood}</span>
                        </div>
                     </div>

                     <div className="p-2 bg-white/5 rounded border border-white/10 mt-2">
                        <div className="text-[9px] text-gray-500 mb-1">AGENT THOUGHT PROCESS</div>
                        <div className="text-white italic">
                            "Optimizing geometry for {currentMood} energy levels. Maintaining visual coherence index > 0.85."
                        </div>
                     </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default VJConsole;
