// Asset Schema for JSON or SQLite (Simplified)
export type AssetType = "image" | "font" | "color" | "other";

export interface Asset {
  id: string; // e.g., "manutd_logo"
  type: AssetType;
  path: string; // Relative path inside assets folder
  tags: string[]; // For basic search keywords like "soccer", "premier-league"
  usage: string[]; // e.g., "team.logo", "background"
}

// Extended Entity Registry (If app has local Team/League Management)
export interface EntityColors {
  primary: string;
  secondary?: string;
  accent?: string;
}

export interface TeamEntity {
  id: string;
  name: string;
  shortName: string;
  color?: EntityColors;
  defaultAssets?: {
    logoId?: string;
    backgroundId?: string;
  };
}
