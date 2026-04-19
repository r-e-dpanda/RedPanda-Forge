import React, { useState, useRef, useEffect } from 'react';
import { Match, Template, Sport, Ratio } from './lib/types';
import { MOCK_MATCHES, MOCK_TEMPLATES } from './lib/mockData';
import EditorWorkspace, { EditorRef } from './components/Editor/EditorWorkspace';
import PasteTemplateModal from './components/PasteTemplateModal';
import { LayoutTemplate, Trophy, Calendar, Settings, Image as ImageIcon, Menu, Check, PanelLeftClose, PanelLeftOpen, Upload, Code, Download } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [selectedSport, setSelectedSport] = useState<Sport>("football");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedRatio, setSelectedRatio] = useState<Ratio>("16:9");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [leftExpanded, setLeftExpanded] = useState(true);
  const [activeLeftTab, setActiveLeftTab] = useState<'matches' | 'templates'>('matches');
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const editorRef = useRef<EditorRef>(null);

  const filteredMatches = MOCK_MATCHES.filter(m => m.sport === selectedSport);
  const filteredTemplates = templates.filter(t => t.sport === selectedSport && t.ratio === selectedRatio);
  const tab2Templates = templates.filter(t => t.sport === selectedSport);

  useEffect(() => {
    if (filteredTemplates.length > 0) {
      if (!selectedTemplate || !filteredTemplates.some(t => t.id === selectedTemplate.id)) {
        setSelectedTemplate(filteredTemplates[0]);
      }
    } else {
      setSelectedTemplate(null);
    }
  }, [selectedSport, selectedRatio, templates]);

  return (
    <div className="flex flex-col h-screen bg-app-bg text-app-text font-sans antialiased overflow-hidden selection:bg-app-accent/30">
      
      {/* TOP BAR (Fixed) */}
      <div className="h-[56px] border-b border-app-border bg-app-sidebar flex items-center justify-between px-5 shrink-0 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-app-accent font-[800] tracking-[-0.5px] text-[1.1rem]">
            <span className="text-[1.2rem]">🐼</span>
            <span>RedPanda Forge</span>
          </div>
          <div className="w-[1px] h-4 bg-app-border"></div>
          <div className="flex items-center gap-4 text-[12px]">
            <div className="flex items-center gap-2">
              <span className="text-app-muted font-[600]">Sport:</span>
              <select 
                value={selectedSport} 
                onChange={(e) => setSelectedSport(e.target.value as Sport)}
                className="bg-black/20 border border-app-border rounded px-2 py-1 text-white outline-none focus:border-app-accent text-[11px]"
              >
                <option value="football">Football</option>
                <option value="basketball">Basketball</option>
                <option value="tennis">Tennis</option>
                <option value="esports">Esports</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-app-muted font-[600]">League:</span>
              <select className="bg-black/20 border border-app-border rounded px-2 py-1 text-white outline-none focus:border-app-accent text-[11px]">
                <option>Premier League</option>
                <option>Champions League</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="text-[10px] font-bold text-app-muted hover:text-white px-3 py-1.5 transition-colors uppercase tracking-wider">
            Save
          </button>
          <button className="text-[10px] font-bold text-app-text bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded transition-all uppercase tracking-wider">
            Batch Generate
          </button>
          <button 
            onClick={() => editorRef.current?.exportPNG()}
            className="text-[10px] font-bold text-black bg-white hover:bg-gray-200 px-4 py-1.5 rounded transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.1)] uppercase tracking-wider"
          >
            <Download size={13} />
            Export PNG
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT COLLAPSED NAV */}
        {!leftExpanded && (
          <div className="w-[56px] flex flex-col items-center bg-app-sidebar border-r border-app-border shrink-0 py-4 gap-6 z-10 transition-all">
            <button 
              onClick={() => setLeftExpanded(true)} 
              className="p-2 text-app-muted hover:text-white hover:bg-white/5 rounded-md transition-colors"
              title="Expand Sidebar"
            >
              <PanelLeftOpen size={18} />
            </button>
            <div className="w-6 h-[1px] bg-app-border"></div>
            <div className="flex flex-col gap-4">
              <button onClick={() => { setLeftExpanded(true); setActiveLeftTab('matches'); }} className="p-2 text-app-muted hover:text-white hover:bg-white/5 rounded-md transition-colors" title="Matches">
                <Calendar size={18} />
              </button>
              <button onClick={() => { setLeftExpanded(true); setActiveLeftTab('templates'); }} className="p-2 text-app-muted hover:text-white hover:bg-white/5 rounded-md transition-colors" title="Templates">
                <LayoutTemplate size={18} />
              </button>
            </div>
          </div>
        )}

        {/* LEFT EXPANDED SIDEBAR (Toggleable) */}
        {leftExpanded && (
          <div className="w-[300px] flex flex-col bg-app-sidebar border-r border-app-border shrink-0 transition-all z-10">
            {/* Header / Tabs */}
            <div className="flex border-b border-app-border">
              <button 
                onClick={() => setActiveLeftTab('matches')}
                className={cn(
                  "flex-1 py-3.5 text-[11px] font-[700] uppercase tracking-[1px] border-b-[2px] transition-colors flex items-center justify-center gap-2", 
                  activeLeftTab === 'matches' 
                    ? "border-app-accent text-app-accent bg-white/5" 
                    : "border-transparent text-app-muted hover:text-white hover:bg-white/5" 
                )}
              >
                <Calendar size={14} />
                Matches
              </button>
              <button 
                onClick={() => setActiveLeftTab('templates')}
                className={cn(
                  "flex-1 py-3.5 text-[11px] font-[700] uppercase tracking-[1px] border-b-[2px] transition-colors flex items-center justify-center gap-2", 
                  activeLeftTab === 'templates' 
                    ? "border-app-accent text-app-accent bg-white/5" 
                    : "border-transparent text-app-muted hover:text-white hover:bg-white/5" 
                )}
              >
                <LayoutTemplate size={14} />
                Templates
              </button>
              <button 
                onClick={() => setLeftExpanded(false)} 
                className="w-[40px] flex items-center justify-center border-b-[2px] border-transparent text-app-muted hover:text-white hover:bg-white/5 transition-colors"
              >
                <PanelLeftClose size={16} />
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-4">
              
              {/* TAB: Matches */}
              {activeLeftTab === 'matches' && (
                <div className="space-y-3">
                  <div className="bg-[#111] border border-app-border rounded-lg p-3 flex flex-col gap-3 mb-4">
                    {/* Ratio Dropdown */}
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-app-muted font-bold">RATIO</span>
                      <select 
                        value={selectedRatio} 
                        onChange={(e) => setSelectedRatio(e.target.value as Ratio)}
                        className="bg-black border border-app-border rounded px-2 py-1 flex-1 ml-4 text-white outline-none focus:border-app-accent text-[11px]"
                      >
                        <option value="16:9">16:9 Landscape</option>
                        <option value="9:16">9:16 Portrait</option>
                      </select>
                    </div>

                    {/* Template Dropdown */}
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-app-muted font-bold">TEMPLATE</span>
                      <select 
                        value={selectedTemplate?.id || ""} 
                        onChange={(e) => {
                          const tpl = templates.find(t => t.id === e.target.value);
                          if (tpl) setSelectedTemplate(tpl);
                        }}
                        className="bg-black border border-app-border rounded px-2 py-1 flex-1 ml-4 text-white outline-none focus:border-app-accent text-[11px] max-w-[150px] truncate"
                        disabled={filteredTemplates.length === 0}
                      >
                        {filteredTemplates.length > 0 ? (
                          filteredTemplates.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))
                        ) : (
                          <option value="">No templates available</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <input type="text" placeholder="Search matches..." className="w-full bg-[#111] border border-app-border rounded p-2.5 text-[12px] text-white outline-none focus:border-app-accent mb-2" />
                  {filteredMatches.map(m => (
                    <div 
                      key={m.id} 
                      onClick={() => setSelectedMatch(m)}
                      className={cn(
                        "p-3 rounded-lg border text-left flex items-center justify-between cursor-pointer transition-all",
                        selectedMatch?.id === m.id
                          ? "bg-app-accent/10 border-app-accent text-white"
                          : "bg-app-bg border-app-border hover:border-app-muted text-app-muted"
                      )}
                    >
                      <div className="flex flex-col flex-1 gap-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-app-muted uppercase tracking-wider mb-1">
                          <span>{m.league}</span>
                          <span>
                            {new Date(m.date).toLocaleDateString()} &middot; {new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={m.homeTeam?.logo || m.player1?.flag} className="w-5 h-5 object-contain" alt="" />
                            <span className={cn("text-[13px] font-[600]", selectedMatch?.id === m.id ? "text-white" : "text-[#cdd0d5]")}>
                              {m.homeTeam?.shortName || m.player1?.name} vs {m.awayTeam?.shortName || m.player2?.name}
                            </span>
                          </div>
                          {selectedMatch?.id === m.id && <Check size={16} className="text-app-accent ml-2 shrink-0" />}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredMatches.length === 0 && (
                    <div className="text-xs text-app-muted p-4 border border-dashed border-app-border rounded text-center">
                      No matches found
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Templates */}
              {activeLeftTab === 'templates' && (
                <div className="space-y-4">
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full text-[11px] font-[700] text-app-accent border border-app-accent/30 hover:bg-app-accent/10 px-3 py-2.5 rounded transition-all flex items-center justify-center gap-2 uppercase tracking-wider mb-2"
                  >
                    <Upload size={14} />
                    Import JSON Template
                  </button>

                  <div className="h-[1px] w-full bg-app-border"></div>

                  {tab2Templates.map((template) => (
                    <div
                      key={template.id}
                      className="w-full flex flex-col group relative rounded-[6px] border border-app-border bg-[#111] overflow-hidden"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-full h-[120px] overflow-hidden bg-black flex items-center justify-center border-b border-app-border">
                        <img 
                          src={template.thumbnail} 
                          alt={template.name}
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                          referrerPolicy="no-referrer"
                        />
                        {/* Overlay badge for Ratio */}
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm border border-white/10">
                          {template.ratio}
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="p-3 text-left">
                        <h4 className="text-[12px] font-bold text-white mb-1 truncate">{template.name}</h4>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] text-app-muted">v1.2.0 • Admin</span>
                          <span className="text-[10px] text-app-muted">19 Apr 2026</span>
                        </div>
                        <button 
                           onClick={() => alert('View details modal coming soon!')}
                           className="w-full text-center py-1.5 text-[10px] font-bold text-app-accent bg-app-accent/10 hover:bg-app-accent/20 rounded uppercase tracking-wider transition-colors"
                        >
                           View Details
                        </button>
                      </div>
                    </div>
                  ))}
                  {tab2Templates.length === 0 && (
                    <div className="text-xs text-app-muted p-4 border border-dashed border-app-border rounded text-center">
                      No templates in library
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MAIN PANEL: Canvas Editor (Takes up center + contextual right panel internally) */}
        <EditorWorkspace ref={editorRef} template={selectedTemplate} match={selectedMatch} />

      </div>

      {/* BOTTOM STATUS BAR */}
      <div className="h-[28px] border-t border-app-border bg-app-bg shrink-0 flex items-center px-4 justify-between text-[10px] text-app-muted font-mono z-20">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Ready</span>
          {selectedTemplate && (
            <>
              <span>•</span>
              <span>{selectedTemplate.width}×{selectedTemplate.height}</span>
              <span>•</span>
              <span>{selectedTemplate.layers?.length || 0} layers</span>
            </>
          )}
        </div>
        <div>
          Last export: N/A
        </div>
      </div>

      {/* MODALS */}
      <PasteTemplateModal 
        isOpen={isModalOpen}
        existingTemplates={templates}
        onClose={() => setIsModalOpen(false)}
        onSave={(newTemplate, isUpdate) => {
          if (isUpdate) {
            setTemplates(prev => prev.map(t => t.id === newTemplate.id ? newTemplate : t));
          } else {
            setTemplates(prev => [...prev, newTemplate]);
          }
          setSelectedTemplate(newTemplate);
        }}
      />
      
    </div>
  );
}
