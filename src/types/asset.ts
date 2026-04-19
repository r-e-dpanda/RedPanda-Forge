// Asset Schema for JSON or SQLite (Simplified)
export type AssetType = "image" | "font" | "color" | "other";

export interface Asset {
  id: string; // e.g., "manutd_logo"
  type: AssetType;
  path: string; // Relative path inside assets folder
  tags: string[]; // For basic search keywords like "football", "premier-league"
  usage: string[]; // e.g., "team.logo", "background"
}

// Mở rộng thêm khái niệm Entity Registry (Nếu ứng dụng có Quản lý Đội bóng / Giải đấu cục bộ)
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
