import { create } from "zustand";
import { ALL_LEVELS } from "../lib/levels";

export type Screen = "menu" | "tutorial" | "nights" | "game" | "outro";

type Settings = {
  musicVolume: number;
  sfxVolume: number;
  menuMusicEnabled: boolean;
};

type State = {
  screen: Screen;
  activeLevelId: string | null;
  completedLevels: Record<string, boolean>;
  seenTutorial: boolean;
  settings: Settings;
  settingsOpen: boolean;

  goTo: (screen: Screen) => void;
  startLevel: (levelId: string) => void;
  completeLevel: (levelId: string) => void;
  setSeenTutorial: (v: boolean) => void;
  setMusicVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
  setMenuMusicEnabled: (v: boolean) => void;
  toggleSettings: (v?: boolean) => void;
  resetProgress: () => void;
};

const STORAGE_KEY = "glimbo-progress-v1";

function loadProgress(): { completedLevels: Record<string, boolean>; seenTutorial: boolean; settings: Settings } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return {
    completedLevels: {},
    seenTutorial: false,
    settings: { musicVolume: 0.8, sfxVolume: 0.9, menuMusicEnabled: false },
  };
}

function persist(state: Pick<State, "completedLevels" | "seenTutorial" | "settings">) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        completedLevels: state.completedLevels,
        seenTutorial: state.seenTutorial,
        settings: state.settings,
      })
    );
  } catch {
    /* ignore */
  }
}

const initial = loadProgress();

export const useGameStore = create<State>((set, get) => ({
  screen: "menu",
  activeLevelId: null,
  completedLevels: initial.completedLevels,
  seenTutorial: initial.seenTutorial,
  settings: initial.settings,
  settingsOpen: false,

  goTo: (screen) => set({ screen }),

  startLevel: (levelId) => set({ screen: "game", activeLevelId: levelId }),

  completeLevel: (levelId) => {
    const completedLevels = { ...get().completedLevels, [levelId]: true };
    set({ completedLevels });
    persist({ completedLevels, seenTutorial: get().seenTutorial, settings: get().settings });
  },

  setSeenTutorial: (v) => {
    set({ seenTutorial: v });
    persist({ completedLevels: get().completedLevels, seenTutorial: v, settings: get().settings });
  },

  setMusicVolume: (v) => {
    const settings = { ...get().settings, musicVolume: v };
    set({ settings });
    persist({ completedLevels: get().completedLevels, seenTutorial: get().seenTutorial, settings });
  },

  setSfxVolume: (v) => {
    const settings = { ...get().settings, sfxVolume: v };
    set({ settings });
    persist({ completedLevels: get().completedLevels, seenTutorial: get().seenTutorial, settings });
  },

  setMenuMusicEnabled: (v: boolean) => {
    const settings = { ...get().settings, menuMusicEnabled: v };
    set({ settings });
    persist({ completedLevels: get().completedLevels, seenTutorial: get().seenTutorial, settings });
  },

  toggleSettings: (v) => set((s) => ({ settingsOpen: v ?? !s.settingsOpen })),

  resetProgress: () => {
    const settings = get().settings;
    set({ completedLevels: {}, seenTutorial: false });
    persist({ completedLevels: {}, seenTutorial: false, settings });
  },
}));

export function isGameComplete(completedLevels: Record<string, boolean>) {
  return ALL_LEVELS.every((l) => completedLevels[l.id]);
}

export function overallProgress(completedLevels: Record<string, boolean>) {
  const total = ALL_LEVELS.length;
  const done = ALL_LEVELS.filter((l) => completedLevels[l.id]).length;
  return { done, total, pct: total === 0 ? 0 : done / total };
}
