import { SettingsManager } from './settingsManager';
import { Asset } from '../types/asset';

export class AssetManager {
  private settingsManager: SettingsManager;
  // Fallback simple dictionary
  private assetDictionary: Record<string, Asset> = {};

  constructor(settingsManager: SettingsManager) {
    this.settingsManager = settingsManager;
  }

  /**
   * Load assets map from a local JSON file (manifest.json) inside the assets folder.
   * Keeps it simple, just reading a registry file without heavy SQLite setup for now.
   */
  async loadRegistry(registryJsonString: string) {
    try {
      const parsed = JSON.parse(registryJsonString) as Asset[];
      parsed.forEach(a => {
        this.assetDictionary[a.id] = a;
      });
    } catch(e) {
      console.error("Failed to load asset index", e);
    }
  }

  getAsset(id: string): Asset | undefined {
    return this.assetDictionary[id];
  }

  findAssetsByUsage(usage: string): Asset[] {
    return Object.values(this.assetDictionary).filter(a => a.usage.includes(usage));
  }

  resolvePath(assetIdOrPath: string): string {
    const settings = this.settingsManager.get();
    
    // Check if it's an HTTP URL or Data URI
    if (!assetIdOrPath || assetIdOrPath.startsWith('http') || assetIdOrPath.startsWith('data:')) {
       return assetIdOrPath || "";
    }

    // Lookup in dictionary first, if not found assume it's already a relative path
    const registeredAsset = this.assetDictionary[assetIdOrPath];
    const targetPath = registeredAsset ? registeredAsset.path : assetIdOrPath;
    
    if (settings.useCloudAssets && settings.cdnEndpoint) {
      return `${settings.cdnEndpoint}/${targetPath}`;
    }

    // In Electron, use native file protocol
    return `file://${settings.assetsRoot}/${targetPath}`;
  }
}

// Global instance
import { settingsManager } from './settingsManager';
export const assetManager = new AssetManager(settingsManager);
