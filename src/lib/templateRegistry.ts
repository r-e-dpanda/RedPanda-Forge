import { ForgeTemplate } from "../types/template";
import { AssetManager } from "./assetManager";

export class TemplateRegistry {
  private templates = new Map<string, ForgeTemplate>();
  private assetManager: AssetManager;

  constructor(assetManager: AssetManager) {
    this.assetManager = assetManager;
    // Load mock database temporarily for Web Preview
    this._mockInit();
  }

  async loadAllTemplates(): Promise<void> {
    // In Electron: Scan directory (fs.readdir), parse JSON files, and add to Map.
    console.log("[TemplateRegistry] Scanned local templates directory...");
  }

  getTemplate(id: string): ForgeTemplate | undefined {
    return this.templates.get(id);
  }

  getTemplatesBySport(sport: string, ratio?: string): ForgeTemplate[] {
    const results: ForgeTemplate[] = [];
    this.templates.forEach((tpl) => {
      if (tpl.sport === sport) {
        if (!ratio || tpl.ratio === ratio) {
          results.push(tpl);
        }
      }
    });
    return results;
  }

  async reload(): Promise<void> {
    this.templates.clear();
    await this.loadAllTemplates();
  }
  
  private _mockInit() {
    // Mock template từ câu lệnh của User
    this.templates.set("football-16x9-standard-v1", {
      id: "football-16x9-standard-v1",
      name: "Standard Match Card",
      version: "1.0",
      sport: "football",
      ratio: "16:9",
      canvas: {
        width: 1920,
        height: 1080,
        backgroundColor: "#0a0a0a"
      },
      layers: [] // Lược giản UI
    } as any);
  }
}

import { assetManager } from './assetManager';
export const templateRegistry = new TemplateRegistry(assetManager);
