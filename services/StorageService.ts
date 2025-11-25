
import { Preset, AgentState } from '../types';

const PRESETS_KEY = 'wenvis_vj_presets_v1';
const AGENT_KEY = 'wenvis_vj_agent_v1';

export const StorageService = {
  // --- PRESETS (COMBO) DB ---
  getPresets: (): Preset[] => {
    try {
      const stored = localStorage.getItem(PRESETS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("DB Read Error (Presets):", e);
      return [];
    }
  },

  savePreset: (preset: Preset): Preset[] => {
    try {
      const current = StorageService.getPresets();
      // Check for duplicates based on name or exact core/fx combo? For now allow all.
      const updated = [...current, preset];
      localStorage.setItem(PRESETS_KEY, JSON.stringify(updated));
      console.log(`[Storage] Saved Preset: ${preset.name} (Total: ${updated.length})`);
      return updated;
    } catch (e) {
      console.error("DB Write Error (Presets):", e);
      return [];
    }
  },

  deletePreset: (id: string): Preset[] => {
    try {
      const current = StorageService.getPresets();
      const updated = current.filter(p => p.id !== id);
      localStorage.setItem(PRESETS_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error("DB Delete Error:", e);
      return [];
    }
  },

  // --- AGENT STATE DB ---
  getAgentState: (): AgentState | null => {
    try {
      const stored = localStorage.getItem(AGENT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  },

  saveAgentState: (state: AgentState) => {
    try {
      localStorage.setItem(AGENT_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("DB Write Error (Agent):", e);
    }
  }
};
