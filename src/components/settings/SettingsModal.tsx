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
    <div className="space-y-2 text-app-text">
      <label className="text-[13px] font-bold text-app-muted flex items-center gap-1.5 uppercase tracking-wider">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </label>
      <div className="flex">
        <input 
          type="text" 
          value={localDraft[field as keyof AppSettings] as string}
          onChange={(e) => setLocalDraft({...localDraft, [field]: e.target.value})}
          placeholder={placeholder}
          className="flex-1 bg-app-bg border border-app-border rounded-l-lg px-4 py-2.5 text-[13.5px] text-app-text placeholder:text-app-muted/50 focus:outline-none focus:border-app-accent transition-colors shadow-inner"
        />
        <button className="bg-app-card border-y border-r border-app-border px-4 rounded-r-lg text-[13px] font-bold text-app-accent hover:bg-app-bg transition-colors active:text-app-text">
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
            <button className="w-full text-left px-4 py-3 rounded-xl bg-app-accent text-black font-extrabold shadow-lg shadow-app-accent/20">
              General Preference
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl text-app-muted hover:text-app-text hover:bg-app-bg text-[14px] font-medium transition-colors">
              Workspace Paths
            </button>
          </div>

          {/* Settings Fields */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-app-bg">
            
            <section className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-app-text tracking-tight">Appearance</h3>
                <p className="text-[14px] text-app-muted mt-1 font-medium">Select your preferred workspace theme for optimal focus.</p>
              </div>
              <div className="space-y-4 flex flex-col">
                <label className="text-[13px] font-bold text-app-muted uppercase tracking-wider">Theme Library</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                  {Object.entries(themes).map(([id, theme]: [string, any]) => (
                    <button 
                      key={id}
                      onClick={() => setLocalDraft({...localDraft, theme: id as any})}
                      className={cn(
                        "p-4 rounded-2xl border flex flex-col items-start gap-3 transition-all text-left group",
                        localDraft.theme === id 
                          ? "bg-app-accent/5 border-app-accent ring-2 ring-app-accent/20 shadow-lg shadow-app-accent/5" 
                          : "bg-app-card border-app-border text-app-muted hover:bg-app-bg hover:border-app-muted/30"
                      )}
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div 
                          className="w-12 h-12 rounded-xl border border-app-border shrink-0 flex items-center justify-center p-1.5 shadow-sm"
                          style={{ backgroundColor: theme.colors.bg }}
                        >
                          <div 
                            className="w-full h-full rounded-md shadow-inner"
                            style={{ backgroundColor: theme.colors.accent }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={cn("text-[14px] font-bold truncate tracking-tight", localDraft.theme === id ? "text-app-text" : "text-app-muted group-hover:text-app-text")}>
                            {theme.name}
                          </div>
                          <div className="text-[11px] opacity-70 truncate uppercase tracking-widest font-mono font-bold mt-0.5">
                            {id}
                          </div>
                        </div>
                      </div>
                      <p className="text-[12.5px] opacity-60 line-clamp-2 mt-1 font-medium leading-relaxed">
                        {theme.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-app-border/30"></div>
            
            <section className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-app-text tracking-tight">Typography & Scale</h3>
                <p className="text-[14px] text-app-muted mt-1 font-medium">Adjust the interface size to match your screen density and preference.</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-app-card p-4 rounded-xl border border-app-border">
                  <div className="space-y-1">
                    <label className="text-[13px] font-bold text-app-muted uppercase tracking-wider">UI Scale</label>
                    <p className="text-[12px] text-app-muted/80">Current base: {Math.round(13 * (localDraft.uiScale || 1.0))}px</p>
                  </div>
                  <div className="flex items-center gap-4 w-64">
                    <input 
                      type="range"
                      min="0.8"
                      max="1.5"
                      step="0.05"
                      value={localDraft.uiScale || 1.0}
                      onChange={(e) => setLocalDraft({...localDraft, uiScale: parseFloat(e.target.value)})}
                      className="flex-1 accent-app-accent h-1.5 bg-app-bg rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-[14px] font-mono font-bold text-app-accent w-12 text-right">
                      {Math.round((localDraft.uiScale || 1.0) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-app-border/30"></div>

            <section className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-app-text tracking-tight">Storage Locations</h3>
                <p className="text-[14px] text-app-muted mt-1 font-medium">Configure your workspace folders for native operations.</p>
              </div>
              
              <div className="space-y-5">
                <InputField label="Assets Root" field="assetsRoot" icon={HardDrive} placeholder="/path/to/assets" />
                <InputField label="Templates Root" field="templatesRoot" icon={Folder} placeholder="/path/to/templates" />
              </div>
            </section>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-app-border bg-app-sidebar flex items-center justify-between">
          <div className="text-[12.5px] text-app-muted flex items-center gap-2 font-medium">
            <HelpCircle className="w-5 h-5 text-app-accent" /> Ready to forge.
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => toggleModal(false)}
              className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-app-muted hover:text-app-text transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-2.5 rounded-xl text-[14px] font-extrabold bg-app-accent text-black hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-app-accent/20 active:scale-95"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-app-bg/30 border-t-app-bg rounded-full animate-spin"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              Save Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
