import { ForgeTemplate } from "../types/template";
import { AssetManager } from "./assetManager";

export class TemplateRegistry {
  private templates = new Map<string, ForgeTemplate>();
  private assetManager: AssetManager;
  private isLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  constructor(assetManager: AssetManager) {
    this.assetManager = assetManager;
  }

  async loadAllTemplates(): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadingPromise) return this.loadingPromise;
    
    this.loadingPromise = (async () => {
      try {
        console.log("[TemplateRegistry] Loading templates from registry...");
        
        // Standard Pack is our default Unit of Distribution
        console.log("[TemplateRegistry] Fetching pack.json from /templates/standard_pack/pack.json");
        const packResponse = await fetch("/templates/standard_pack/pack.json");
        if (!packResponse.ok) throw new Error(`Failed to load standard pack: ${packResponse.status} ${packResponse.statusText}`);
        
        const pack = await packResponse.json();
        console.log("[TemplateRegistry] Pack loaded, templates to fetch:", pack.templates);
        
        // Fetch each template definition in the pack
        const templatePromises = pack.templates.map(async (tplId: string) => {
          try {
            const tplUrl = `/templates/standard_pack/templates/${tplId}/template.json`;
            const tplResponse = await fetch(tplUrl);
            if (!tplResponse.ok) {
              console.warn(`[TemplateRegistry] Template definition not found for ${tplId} at ${tplUrl}`);
              return null;
            }
            const tpl = await tplResponse.json();
            
            // Validate minimal structure
            if (!tpl.id || !tpl.sport) {
              console.warn(`[TemplateRegistry] Invalid template JSON (missing id or sport) for ${tplId}`);
              return null;
            }
            
            console.log(`[TemplateRegistry] Successfully loaded template: ${tpl.id} (${tpl.sport})`);
            return tpl;
          } catch (e) {
            console.error(`[TemplateRegistry] Failed to parse template ${tplId}:`, e);
            return null;
          }
        });
        
        const loadedTemplates = await Promise.all(templatePromises);
        
        loadedTemplates.forEach(tpl => {
          if (tpl) {
            this.templates.set(tpl.id, tpl);
          }
        });
        
        this.isLoaded = true;
        console.log(`[TemplateRegistry] Successfully loaded ${this.templates.size} templates.`);
      } catch (error) {
        console.error("[TemplateRegistry] Critical error loading templates:", error);
        this.isLoaded = false; // Allow retry
      } finally {
        this.loadingPromise = null;
      }
    })();

    return this.loadingPromise;
  }

  getTemplate(id: string): ForgeTemplate | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): ForgeTemplate[] {
    return Array.from(this.templates.values());
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
    this.isLoaded = false;
    await this.loadAllTemplates();
  }
}

import { assetManager } from './assetManager';
export const templateRegistry = new TemplateRegistry(assetManager);
