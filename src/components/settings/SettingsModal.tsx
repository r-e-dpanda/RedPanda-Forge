import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { X, Folder, Save, HelpCircle, HardDrive, Settings2 } from 'lucide-react';
import { AppSettings } from '../../types/settings';
import themes from '../../constants/themes.json';
import { cn } from '../../lib/utils';

export const SettingsModal = () => {
  const { settings, isOpen, toggleModal, updateSettings } = useSettingsStore();
  const [localDraft, setLocalDraft] = useState<AppSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  // Sync draft whenever store changes OR modal opens
  useEffect(() => {
    if (isOpen) setLocalDraft(settings);
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await updateSettings(localDraft);
    setTimeout(() => {
      setIsSaving(false);
      toggleModal(false);
    }, 400); // Fake delay animation
  };

  const InputField = ({ label, field, placeholder, icon: Icon }: any) => (
    <div className="space-y-1.5 text-app-text">
      <label className="text-xs font-semibold text-app-muted flex items-center gap-1.5 uppercase tracking-wide">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </label>
      <div className="flex">
        <input 
          type="text" 
          value={localDraft[field as keyof AppSettings] as string}
          onChange={(e) => setLocalDraft({...localDraft, [field]: e.target.value})}
          placeholder={placeholder}
          className="flex-1 bg-app-bg border border-app-border rounded-l-md px-3 py-2 text-sm text-app-text placeholder:text-app-muted/50 focus:outline-none focus:border-app-accent transition-colors"
        />
        <button className="bg-app-card border-y border-r border-app-border px-3 rounded-r-md text-xs font-medium text-app-muted hover:bg-app-bg transition-colors">
          Browse
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-app-sidebar border border-app-border rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-app-border flex items-center justify-between bg-app-sidebar/50">
          <div className="flex items-center gap-2 text-app-text font-medium">
            <Settings2 className="w-5 h-5 text-app-accent" />
            App Settings
          </div>
          <button 
            onClick={() => toggleModal(false)}
            className="p-1 rounded-md text-app-muted hover:text-app-text hover:bg-app-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Side Menu */}
          <div className="w-48 border-r border-app-border bg-app-sidebar/30 p-2 space-y-1">
            <button className="w-full text-left px-3 py-2 rounded-md bg-app-accent/10 text-app-accent text-sm font-medium border border-app-accent/20">
              General Preference
            </button>
            <button className="w-full text-left px-3 py-2 rounded-md text-app-muted hover:text-app-text hover:bg-app-bg text-sm transition-colors">
              Workspace Paths
            </button>
          </div>

          {/* Settings Fields */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-app-bg">
            
            <section className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-app-text">Appearance</h3>
                <p className="text-sm text-app-muted mt-1">Select your preferred workspace theme for optimal focus.</p>
              </div>
              <div className="space-y-3 flex flex-col">
                <label className="text-xs font-semibold text-app-muted uppercase tracking-wide">Theme Library</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  {Object.entries(themes).map(([id, theme]: [string, any]) => (
                    <button 
                      key={id}
                      onClick={() => setLocalDraft({...localDraft, theme: id as any})}
                      className={cn(
                        "p-3 rounded-lg border flex flex-col items-start gap-2 transition-all text-left",
                        localDraft.theme === id 
                          ? "bg-app-accent/5 border-app-accent ring-1 ring-app-accent/20" 
                          : "bg-app-card border-app-border text-app-muted hover:bg-app-bg"
                      )}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div 
                          className="w-10 h-10 rounded-md border border-app-border shrink-0 flex items-center justify-center p-1"
                          style={{ backgroundColor: theme.colors.bg }}
                        >
                          <div 
                            className="w-full h-full rounded-sm"
                            style={{ backgroundColor: theme.colors.accent }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={cn("text-sm font-bold truncate", localDraft.theme === id ? "text-app-text" : "text-app-muted")}>
                            {theme.name}
                          </div>
                          <div className="text-[10px] opacity-70 truncate uppercase tracking-wider font-mono">
                            {id}
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] opacity-60 line-clamp-2 mt-1">
                        {theme.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-app-border/30"></div>

            <section className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-app-text">Storage Locations</h3>
                <p className="text-sm text-app-muted mt-1">Configure your workspace folders for native operations.</p>
              </div>
              
              <InputField label="Assets Root" field="assetsRoot" icon={HardDrive} placeholder="/path/to/assets" />
              <InputField label="Templates Root" field="templatesRoot" icon={Folder} placeholder="/path/to/templates" />
            </section>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-app-border bg-app-sidebar/80 flex items-center justify-between">
          <div className="text-xs text-app-muted flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" /> Ready to forge.
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => toggleModal(false)}
              className="px-4 py-2 rounded-md text-sm font-medium text-app-muted hover:text-app-text transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 rounded-md text-sm font-bold bg-app-accent text-app-bg hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-app-accent/20"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-app-bg/30 border-t-app-bg rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
