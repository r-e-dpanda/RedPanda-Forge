export interface AppSettings {
  version: string;
  theme: "dark" | "ice" | "light";
  
  // Main folder selected by the user
  assetsRoot: string;
  templatesRoot: string;
  
  // Other options
  defaultRatio: "16:9" | "9:16" | "1:1";
  uiScale: number; // Logic: 1.0 = base, 1.1 = 110%
  autoSave: boolean;
  lastUsedSport: string;
  
  // Future Cloud Config
  useCloudAssets?: boolean;
  cdnEndpoint?: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  version: "1.0.0",
  theme: "dark",
  assetsRoot: "", 
  templatesRoot: "",
  defaultRatio: "16:9",
  uiScale: 1.0,
  autoSave: true,
  lastUsedSport: "football",
  useCloudAssets: false,
  cdnEndpoint: "https://my-cdn.com/assets",
};
