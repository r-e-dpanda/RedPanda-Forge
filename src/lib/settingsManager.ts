import { AppSettings, DEFAULT_SETTINGS } from '../types/settings';

// Giả lập môi trường Electron IPC / FS (Cho phép chạy trên Browser hiện tại)
// Khi migrate sang main process của Electron thật, bạn có thể comment lại block này 
// và sử dụng fs.readFile, fs.writeFile thông qua contextBridge.

export class SettingsManager {
  private settings: AppSettings = { ...DEFAULT_SETTINGS };

  async load(): Promise<AppSettings> {
    try {
      // MOCK: Web Storage, thay thế bằng `await window.electron.invoke('read-settings')` sau này
      const data = localStorage.getItem('redpanda_forge_settings');
      if (data) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      } else {
        await this.setupDefaultAssetsFolder();
        await this.save();
      }
    } catch (err) {
      await this.save();
      await this.setupDefaultAssetsFolder();
    }
    return this.settings;
  }

  async save(): Promise<void> {
    // MOCK: Thay thế bằng `await window.electron.invoke('write-settings', this.settings)`
    localStorage.setItem('redpanda_forge_settings', JSON.stringify(this.settings));
  }

  get(): AppSettings {
    return this.settings;
  }

  async update(newSettings: Partial<AppSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await this.save();
  }

  private async setupDefaultAssetsFolder() {
    // Giả lập thư mục Documents mặc định
    const documentsPath = "C:/Users/RedPanda/Documents/RedPanda Workspace"; // Mock path
    
    if (!this.settings.assetsRoot) {
      // Peer directories
      this.settings.assetsRoot = `${documentsPath}/Assets`;
      this.settings.templatesRoot = `${documentsPath}/Templates`;
      
      // Ở Desktop thực tế, bạn sẽ chạy:
      // await fs.mkdir(this.settings.assetsRoot, { recursive: true });
      // await fs.mkdir(this.settings.templatesRoot, { recursive: true });
    }
  }
}

// Global instance
export const settingsManager = new SettingsManager();
