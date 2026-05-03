// This file defines the global types injected by Electron Preload script
export interface ElectronAPI {
  isDesktop: boolean;
  openFile: () => Promise<string | null>;
  // Add other methods here
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
