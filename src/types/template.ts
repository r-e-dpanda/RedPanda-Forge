export type ExportFormat = "json" | "png" | "jpeg";

export type Sport = "football" | "tennis" | "basketball" | "esports";
export type Ratio = "16:9" | "9:16" | "1:1";

// 1. Definition cho Data Engine
export type TeamColor = string | {
  primary: string;
  secondary?: string;
  accent?: string;
};

export interface TeamKit {
  type: "home" | "away" | "third" | "gk";
  primary?: string; // override color for this kit
  image?: string;   // optional image pattern for the kit
}

export interface TeamAssets {
  logo: string;
  badge?: string;
  kit?: {
    home?: TeamKit;
    away?: TeamKit;
    third?: TeamKit;
  };
  background?: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string; // Keep for backwards compatibility
  color?: TeamColor; // Keep for backwards compatibility
  colors?: {
    primary: string;
    secondary?: string;
    accent?: string;
  };
  assets?: TeamAssets;
}

export interface Player {
  id: string;
  name: string;
  flag?: string;
  image?: string; // added player image
}

export interface MatchCompetition {
  id: string;
  name: string;
  logo?: string;
  trophy?: string;
}

export interface MatchTeamOverrides {
  kit?: TeamKit;
}

export interface Match {
  id: string;
  sport: Sport;
  league: string;
  competition?: MatchCompetition; // structured competition
  date: string; // ISO
  venue?: string;
  isLive?: boolean;
  score?: string;
  liveBadge?: boolean;
  homeTeam?: Team;
  awayTeam?: Team;
  homeTeamOverrides?: MatchTeamOverrides; // overrides inside match
  awayTeamOverrides?: MatchTeamOverrides;
  player1?: Player;
  player2?: Player;
}

// 2. Definition cho Domain-specific JSON Schema UI Template
export type ElementType = "Image" | "Text" | "Shape" | "Line" | "Group";

export interface Coordinates {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface ElementStyle {
  // Styles for Text
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: "normal" | "bold" | "italic" | number;
  align?: "left" | "center" | "right";
  
  // Styles for Shape/Line/Text
  fill?: string | { type: "linear" | "radial"; colors: string[]; stops: number[] };
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number | number[]; // For shapes
  
  // Drop Shadow
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
    opacity?: number;
  };
}

export interface BaseElement {
  id: string;
  type: ElementType;
  name: string;
  zIndex: number;
  locked?: boolean;
  visible?: boolean;
  expanded?: boolean;
  
  // Data Binding
  dataKey?: string;
  visibleDataKey?: string; // Logic hiển thị (VD: "isLive")
  fallback?: string;       // Giá trị dự phòng nếu dataKey rỗng
  formatters?: string[];   // Array of formatter pipelines (VD: ["uppercase", "shorten:10"])
  
  // Legacy / existing formatting (keep for backward compatibility)
  position: Coordinates;
  size?: Dimensions; // Line có thể không có size mà dùng points
  scale?: Coordinates;
  rotation?: number;
  opacity?: number;
  anchor?: "topLeft" | "center" | "bottomRight";
}

// --- Specific Type Implementations ---

export interface ImageElement extends BaseElement {
  type: "Image";
  src: string;
  objectFit?: "cover" | "contain" | "fill";
}

export interface TextElement extends BaseElement {
  type: "Text";
  dataType?: "string" | "number" | "boolean" | "array" | "object" | "date" | "time";
  text?: string;
  style: ElementStyle;
  transform?: "none" | "uppercase" | "lowercase";
  letterSpacing?: number;
  lineHeight?: number;
}

export interface ShapeElement extends BaseElement {
  type: "Shape";
  shapeType: "rect" | "circle" | "ellipse" | "polygon";
  style: ElementStyle;
  points?: number[]; // Cho Polygon
}

export interface LineElement extends BaseElement {
  type: "Line";
  points: number[]; // [x1, y1, x2, y2, ...]
  tension?: number;
  arrowHead?: boolean;
  style: ElementStyle; // Thường dùng fill hoặc stroke
}

export interface GroupElement extends BaseElement {
  type: "Group";
  children: TemplateNode[]; // Hỗ trợ nesting
}

export type TemplateNode = ImageElement | TextElement | ShapeElement | LineElement | GroupElement;

// (Thay vì Layer Group như ngày xưa, chúng ta có thể giữ LayersArray làm root)
export interface Template {
  id: string;
  name: string;
  version: string;
  sport: Sport;
  ratio: Ratio;
  thumbnail?: string;
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
  };
  layers: TemplateNode[];
}

export type ForgeTemplate = Template;
export type TemplateElement = TemplateNode;
