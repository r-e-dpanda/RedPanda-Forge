import React, { useState, useRef } from 'react';
import { X, Upload, FileJson, AlertTriangle } from 'lucide-react';
import { Template } from '../types/template';

interface PasteTemplateModalProps {
  isOpen: boolean;
  existingTemplates: Template[];
  onClose: () => void;
  onSave: (template: Template, isUpdate: boolean) => void;
}

export default function PasteTemplateModal({ isOpen, existingTemplates, onClose, onSave }: PasteTemplateModalProps) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [conflictTemplate, setConflictTemplate] = useState<{ new: any; old: Template } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setJsonText('');
    setError('');
    setConflictTemplate(null);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setJsonText(text);
      setError('');
    };
    reader.onerror = () => {
      setError("Failed to read file.");
    };
    reader.readAsText(file);
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const validateAndParse = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.layers || !Array.isArray(parsed.layers)) {
        throw new Error('Invalid JSON: Must contain a "layers" array.');
      }
      return parsed;
    } catch (err: any) {
      setError(err.message || 'Invalid JSON format');
      return null;
    }
  };

  const handleInitialImport = () => {
    const parsed = validateAndParse();
    if (!parsed) return;

    // Check for ID collision
    const existing = existingTemplates.find(t => t.id === parsed.id);
    if (existing) {
      setConflictTemplate({ new: parsed, old: existing });
    } else {
      finalizeSave(parsed, false);
    }
  };

  const finalizeSave = (parsedData: any, isUpdate: boolean) => {
    const newTemplate: Template = {
      ...parsedData,
      id: parsedData.id || `custom_${Date.now()}`,
      name: parsedData.name || 'Custom Template',
      sport: parsedData.sport || 'football',
      ratio: parsedData.ratio || '16:9',
      version: parsedData.version || '1.0.0',
      thumbnail: parsedData.thumbnail || 'https://images.unsplash.com/photo-1550567751-0b5c1ab0e5e0?auto=format&fit=crop&q=80&w=400&h=225',
    };

    onSave(newTemplate, isUpdate);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-[600px] bg-app-sidebar border border-app-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-app-border">
          <h2 className="text-[15px] font-bold text-white flex items-center gap-2">
            <FileJson size={20} className="text-app-accent" /> Import Template JSON
          </h2>
          <button onClick={handleClose} className="p-2 rounded-lg text-app-muted hover:text-white hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Conflicting Template View */}
        {conflictTemplate ? (
          <>
            <div className="p-8">
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-start gap-4 mb-4">
                <AlertTriangle className="text-red-400 mt-0.5 shrink-0" size={28} />
                <div>
                  <h3 className="text-white font-bold text-[15px] mb-1.5">Template ID Conflict</h3>
                  <p className="text-app-muted text-[13.5px] leading-relaxed">
                    A template with ID <span className="text-red-300 font-mono font-bold">"{conflictTemplate.new.id}"</span> already exists.
                  </p>
                  
                  <div className="mt-5 flex flex-col gap-3 bg-black/40 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-app-muted">Current Version:</span>
                      <span className="text-white font-mono font-bold">{conflictTemplate.old.version || '1.0.0'}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-app-muted">Importing Version:</span>
                      <span className="text-app-accent font-bold font-mono">{conflictTemplate.new.version || '1.0.0'}</span>
                    </div>
                  </div>
                  
                  <p className="text-app-muted text-[13.5px] mt-5">
                    Do you want to overwrite the existing template with this imported version?
                  </p>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-8 py-5 border-t border-app-border bg-app-card flex justify-end gap-3">
              <button 
                onClick={() => setConflictTemplate(null)} 
                className="px-6 py-2.5 text-[13px] font-bold text-app-muted hover:text-white transition-colors"
              >
                GO BACK
              </button>
              <button 
                onClick={() => finalizeSave(conflictTemplate.new, true)} 
                className="px-8 py-2.5 bg-red-600 text-white rounded-xl text-[13.5px] font-bold hover:bg-red-500 transition-all flex items-center gap-2 shadow-lg shadow-red-600/10"
              >
                <AlertTriangle size={16} />
                OVERWRITE TEMPLATE
              </button>
            </div>
          </>
        ) : (
          /* Normal Import View */
          <>
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-end">
                <label className="text-[13px] text-app-muted uppercase tracking-[1.5px] font-bold block">
                  Paste JSON
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-app-muted italic font-medium">or</span>
                  <input 
                    type="file" 
                    accept=".json"
                    ref={fileInputRef}
                    className="hidden" 
                    onChange={handleFileUpload} 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-app-border transition-colors text-[12.5px] font-bold"
                  >
                    <Upload size={16} className="text-app-accent" />
                    Upload .json File
                  </button>
                </div>
              </div>
              
              <div>
                <textarea 
                  placeholder='Paste { "layers": [...] } here...' 
                  className="w-full h-[360px] bg-[#0A0A0C] border border-app-border rounded-xl px-5 py-5 text-[#a0c5e8] font-mono text-[13px] outline-none focus:border-app-accent resize-none placeholder:text-app-muted/30 overflow-auto shadow-inner leading-relaxed"
                  value={jsonText}
                  onChange={(e) => {
                    setJsonText(e.target.value);
                    setError(''); // clear error on type
                  }}
                  spellCheck={false}
                />
                {error && <p className="text-red-500 text-[13px] mt-2.5 flex items-center gap-1.5 font-bold"><AlertTriangle size={16} /> {error}</p>}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-app-border bg-app-card flex justify-end gap-3">
              <button 
                onClick={handleClose} 
                className="px-6 py-2.5 text-[13px] font-bold text-app-muted hover:text-white transition-colors"
              >
                CANCEL
              </button>
              <button 
                onClick={handleInitialImport} 
                disabled={!jsonText.trim()}
                className="px-8 py-2.5 bg-app-accent text-app-bg rounded-xl text-[13.5px] font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-app-accent/20"
              >
                IMPORT
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
