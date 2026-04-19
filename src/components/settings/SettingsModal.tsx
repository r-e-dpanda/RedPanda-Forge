import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { X, Folder, Image, Save, HelpCircle, HardDrive, Target, Settings2, Cloud } from 'lucide-react';
import { AppSettings } from '../../types/settings';

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
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5 uppercase tracking-wide">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </label>
      <div className="flex">
        <input 
          type="text" 
          value={localDraft[field as keyof AppSettings] as string}
          onChange={(e) => setLocalDraft({...localDraft, [field]: e.target.value})}
          placeholder={placeholder}
          className="flex-1 bg-zinc-900 border border-zinc-700/50 rounded-l-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
        />
        {/* Nút Browse cho Native Electron, Web sẽ disable */}
        <button className="bg-zinc-800 border-y border-r border-zinc-700/50 px-3 rounded-r-md text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">
          Browse
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2 text-zinc-100 font-medium">
            <Settings2 className="w-5 h-5 text-cyan-400" />
            App Settings
          </div>
          <button 
            onClick={() => toggleModal(false)}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - Split View Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Side Menu */}
          <div className="w-48 border-r border-zinc-800 bg-zinc-900/30 p-2 space-y-1">
            <button className="w-full text-left px-3 py-2 rounded-md bg-cyan-950/30 text-cyan-400 text-sm font-medium border border-cyan-900/50">
              Workspace Paths
            </button>
            <button className="w-full text-left px-3 py-2 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-sm transition-colors">
              Preferences
            </button>
            <button className="w-full text-left px-3 py-2 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-sm transition-colors flex items-center justify-between opacity-50 cursor-not-allowed">
              Cloud Config <span className="text-[10px] bg-zinc-800 px-1.5 rounded text-zinc-500">PRO</span>
            </button>
          </div>

          {/* Settings Fields */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-zinc-950">
            
            <section className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-white">Appearance</h3>
                <p className="text-sm text-zinc-500 mt-1">Customize the look and feel of the app.</p>
              </div>
              <div className="space-y-1.5 flex flex-col">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Theme</label>
                <div className="flex gap-3 mt-1">
                  <button 
                    onClick={() => setLocalDraft({...localDraft, theme: 'dark'})}
                    className={`flex-1 py-3 px-4 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${localDraft.theme === 'dark' ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800/50'}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#050505] border border-zinc-700"></div>
                    <span className="text-sm font-medium">Dark (Default)</span>
                  </button>
                  <button 
                    onClick={() => setLocalDraft({...localDraft, theme: 'ice'})}
                    className={`flex-1 py-3 px-4 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${localDraft.theme === 'ice' ? 'bg-slate-50 border-teal-500 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#14b8a6] shadow-[0_0_10px_rgba(20,184,166,0.3)]"></div>
                    <span className="text-sm font-medium">Icy Mint</span>
                  </button>
                </div>
              </div>
            </section>

            <div className="w-full h-px bg-zinc-800"></div>

            <section className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-white">Storage Locations</h3>
                <p className="text-sm text-zinc-500 mt-1">Configure where RedPanda Forge saves and loads native assets. Important for Desktop operations.</p>
              </div>
              
              <InputField label="Assets Root Directory" field="assetsRoot" icon={HardDrive} placeholder="C:/Users/name/Documents/RedPanda Forge" />
              <InputField label="Templates Database Directory" field="templatesRoot" icon={Folder} placeholder="C:/Users/name/Documents/RedPanda Forge/templates" />
            </section>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <div className="text-xs text-zinc-500 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" /> Changes require an app reload to mount new folders.
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => toggleModal(false)}
              className="px-4 py-2 rounded-md text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 rounded-md text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center gap-2 shadow-lg shadow-cyan-900/20"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
