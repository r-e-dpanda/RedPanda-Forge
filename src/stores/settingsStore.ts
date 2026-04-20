import { create } from "zustand";
import { AppSettings, DEFAULT_SETTINGS } from "../types/settings";
import { settingsManager } from "../lib/settingsManager";

interface SettingsState {
  settings: AppSettings;
  isOpen: boolean;
  
  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  toggleModal: (open?: boolean) => void;
}

const getInitialSettings = (): AppSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const data = localStorage.getItem('redpanda_forge_settings');
  if (data) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: getInitialSettings(),
  isOpen: false,

  loadSettings: async () => {
    const data = await settingsManager.load();
    set({ settings: data });
  },

  updateSettings: async (newSettings) => {
    await settingsManager.update(newSettings);
    // Reload state cho các Component khác
    set({ settings: settingsManager.get() });
  },

  toggleModal: (open) => {
    if (open !== undefined) {
      set({ isOpen: open });
    } else {
      set({ isOpen: !get().isOpen });
    }
  }
}));
