export type Sport = "football" | "tennis" | "basketball" | "esports";

export type Ratio = "16:9" | "9:16";

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string; // URL
  color: string;
}

export interface Player {
  id: string;
  name: string;
  flag?: string; // URL
  image?: string; // URL
}

export interface Match {
  id: string;
  sport: Sport;
  league: string;
  date: string; // ISO String
  venue?: string;
  liveBadge?: boolean;
  score?: string;
  
  // Specific to team sports
  homeTeam?: Team;
  awayTeam?: Team;
  
  // Specific to individual sports
  player1?: Player;
  player2?: Player;
}

export type LayerType = "BackgroundImage" | "Image" | "image" | "Text" | "text" | "Shape" | "rect" | "GradientOverlay";

export interface TemplateElement {
  id: string;
  type: LayerType;
  name?: string;      
  label?: string; // From new JSON
  dataKey?: string | null;  // Data binding key
  visible?: boolean;
  draggable?: boolean;
  
  // Positioning properties
  x: number;
  y: number;
  width: number;
  height?: number;
  rotation?: number;
  opacity?: number;
  
  // Specific to Image handling
  src?: string; // Default or fallback image
  scaleMode?: string;
  
  // Specific to Text
  text?: string;       // Default text
  fontFamily?: string;
  fontSize?: number;
  fill?: string;       // Color
  align?: "left" | "center" | "right";
  fontWeight?: "normal" | "bold" | "italic";
  textTransform?: "none" | "uppercase" | "lowercase";
  fontStyle?: "normal" | "italic";
  letterSpacing?: number;
  stroke?: string;
  strokeWidth?: number;
  
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;

  // Specific to Shape/Gradient
  cornerRadius?: number;
  gradientColors?: string[]; // e.g., ["#000000", "#FFFFFF"]

  // Editor specific
  editableProperties?: string[]; // e.g., ["x", "y", "fontSize", "fill"]
}

export interface TemplateLayer {
  id: string;
  name: string;
  visible?: boolean;
  locked?: boolean;
  expanded?: boolean; // UI state for editor
  elements: TemplateElement[];
}

export interface Template {
  id: string;
  name: string;
  sport: Sport;
  ratio: Ratio;
  thumbnail?: string; // Preview image
  width: number;
  height: number;
  description?: string;
  tags?: string[];
  version?: string;
  createdAt?: string;
  background?: string;
  fontFamilies?: string[];
  layers: TemplateLayer[];
}
