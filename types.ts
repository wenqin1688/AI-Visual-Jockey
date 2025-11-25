
export enum AudioSourceMode {
  None = 'NONE',
  File = 'FILE',
  Microphone = 'MICROPHONE'
}

export enum ShapeType {
  VJ_Cosmic = 'COSMIC',    
  Image = 'IMAGE'          
}

export interface Preset {
  id: string;
  name: string;
  coreIndex: number;
  effectIndex: number;
  color: string | null;
  timestamp: number;
}

export interface AgentLog {
  id: string;
  timestamp: string;
  type: 'INFO' | 'DECISION' | 'ANALYSIS' | 'EVOLUTION' | 'ERROR';
  message: string;
}

export interface AgentState {
  level: number;
  xp: number;
  nextLevelXp: number;
  status: 'IDLE' | 'LISTENING' | 'ANALYZING' | 'EVOLVING';
}

export interface SentimentData {
  baseColor: [number, number, number]; // RGB 0-1
  secondaryColor: [number, number, number]; // RGB 0-1
  turbulence: number; // How chaotic the movement is (0-1)
  speed: number; // Animation speed multiplier
  description: string; // Debug label
}
