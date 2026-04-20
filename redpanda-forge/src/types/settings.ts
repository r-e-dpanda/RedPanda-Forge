export interface AppSettings {
  version: string;
  theme: "dark" | "ice" | "light";
  
  // Thư mục chính do người dùng chọn (Quan trọng nhất)
  assetsRoot: string;
  templatesRoot: string;
  
  // Tùy chọn khác
  defaultRatio: "16:9" | "9:16" | "1:1";
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
  autoSave: true,
  lastUsedSport: "football",
  useCloudAssets: false,
  cdnEndpoint: "https://my-cdn.com/assets",
};
