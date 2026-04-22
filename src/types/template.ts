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
  logo?: string;
  badge?: string;
  kit?: {
    home?: TeamKit;
    away?: TeamKit;
    third?: TeamKit;
  };
  background?: string;
}

export interface Team {
  id: string; // The Entity ID (e.g. manchester-city, ars, mu)
  name?: string;
  shortName?: string;
  logo?: string; // TBD: Remove once all templates use @global logic
  color?: TeamColor; 
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
export type ElementType = "Image" | "Text" | "Shape" | "Line" | "Group" | "Polygon";

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
  strokeEnabled?: boolean;
  cornerRadius?: number | number[]; // For shapes
  
  // Drop Shadow
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
    opacity?: number;
  };
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
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
  visibleDataKey?: string; // Visibility logic (e.g., "isLive")
  fallback?: string;       // Fallback value if dataKey is empty
  formatters?: string[];   // Array of formatter pipelines (e.g., ["uppercase", "shorten:10"])
  
  // Legacy / existing formatting (keep for backward compatibility)
  position: Coordinates;
  size?: Dimensions; // Line có thể không có size mà dùng points
  scale?: Coordinates;
  rotation?: number;
  opacity?: number;
  skewX?: number;
  skewY?: number;
  flipX?: boolean;
  flipY?: boolean;
  cornerRadius?: number;
  topWidth?: number;
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
  shapeType: "ellipse" | "quad" | "polygon";
  radiusX?: number; // For ellipse
  radiusY?: number; // For ellipse
  style: ElementStyle;
  points?: number[]; // Cho Polygon
}

export interface PolygonElement extends BaseElement {
  type: "Polygon";
  points: number[];
  style: ElementStyle;
}

export interface LineElement extends BaseElement {
  type: "Line";
  points: number[]; // [x1, y1, x2, y2, ...]
  tension?: number;
  arrowHead?: boolean;
  style: ElementStyle; // Usually uses fill or stroke
}

export interface GroupElement extends BaseElement {
  type: "Group";
  children: TemplateNode[]; // Supports nesting
}

export type TemplateNode = ImageElement | TextElement | ShapeElement | LineElement | GroupElement | PolygonElement;

// LayersArray as root
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
