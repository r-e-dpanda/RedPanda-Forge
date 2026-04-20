import React from "react";
import { useEditorStore } from "../stores/editorStore";
import { Folder, Image as ImageIcon, Users, LayoutTemplate, Settings, Check, Files, Wand2 } from "lucide-react";
import { cn } from "../lib/utils";
import { MOCK_MATCHES, MOCK_TEMPLATES } from "../lib/mockData";
import { Sport, Ratio } from "../types/template";

export const LeftSidebar = ({
  selectedSport,
  selectedRatio,
  selectedLeague,
  activeLeftTab,
  setActiveLeftTab,
  setSelectedRatio,
  templates,
  setEditorTemplate,
  activeTemplate,
  activeMatch,
  setEditorMatch,
  setIsModalOpen
}: any) => {
  const filteredMatches = MOCK_MATCHES.filter(m => 
    m.sport === selectedSport && 
    (selectedLeague === "All" || m.league === selectedLeague)
  );
  const filteredTemplates = templates.filter((t: any) => t.sport === selectedSport && (selectedRatio === "All" || t.ratio === selectedRatio));
  const tab2Templates = templates.filter((t: any) => t.sport === selectedSport);

  React.useEffect(() => {
    // DO NOTHING. The user must manually select a template. 
    // We shouldn't auto change the template for them just because they filtered.
  }, [activeTemplate, filteredTemplates, setEditorTemplate]);

  return (
    <div className="w-[280px] bg-app-sidebar border-r border-app-border flex flex-col shrink-0 z-10 transition-all font-sans relative">
      <div className="flex border-b border-app-border bg-app-sidebar h-[56px] shrink-0 font-sans">
        <button 
          onClick={() => setActiveLeftTab('matches')}
          className={cn(
            "flex-1 text-[12px] font-[700] transition-colors border-b-[2px]",
            activeLeftTab === 'matches' ? "border-app-accent text-app-text" : "border-transparent text-app-muted hover:text-app-text hover:bg-app-card"
          )}
        >
          Matches
        </button>
        <button 
          onClick={() => setActiveLeftTab('templates')}
          className={cn(
            "flex-1 text-[12px] font-[700] transition-colors border-b-[2px]",
            activeLeftTab === 'templates' ? "border-app-accent text-app-text" : "border-transparent text-app-muted hover:text-app-text hover:bg-app-card"
          )}
        >
          Templates
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeLeftTab === 'matches' && (
          <div className="p-4 flex flex-col gap-4 relative h-full">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-app-muted font-bold">RATIO</span>
              <select 
                value={selectedRatio} 
                onChange={(e) => setSelectedRatio(e.target.value as Ratio | "All")}
                className="bg-app-bg border border-app-border rounded px-2 py-1 flex-1 ml-4 text-app-text outline-none focus:border-app-accent text-[11px]"
              >
                <option value="All">All Ratios</option>
                <option value="16:9">16:9 Landscape</option>
                <option value="9:16">9:16 Portrait</option>
                <option value="1:1">1:1 Square</option>
              </select>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-app-muted font-bold">TEMPLATE</span>
              <select 
                value={filteredTemplates.some((t: any) => t.id === activeTemplate?.id) ? (activeTemplate?.id || "") : ""} 
                onChange={(e) => {
                  const tpl = templates.find((t: any) => t.id === e.target.value);
                  if (tpl) setEditorTemplate(tpl);
                }}
                className="bg-app-bg border border-app-border rounded px-2 py-1 flex-1 ml-4 text-app-text outline-none focus:border-app-accent text-[11px] max-w-[150px] truncate"
                disabled={filteredTemplates.length === 0}
              >
                {filteredTemplates.length === 0 ? (
                  <option value="" disabled>No template found</option>
                ) : (
                  <>
                    {(!activeTemplate || !filteredTemplates.some((t: any) => t.id === activeTemplate.id)) && (
                      <option value="" disabled>Select template...</option>
                    )}
                    {filteredTemplates.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div className="flex flex-col gap-2 relative">
              <div className="flex items-center justify-between mt-2 mb-1">
                <h3 className="text-[10px] font-bold text-app-muted uppercase tracking-wider">Available Matches</h3>
                {!activeTemplate && (
                  <span className="text-[9px] text-app-accent font-bold uppercase tracking-tighter flex items-center gap-1 animate-pulse">
                    <LayoutTemplate size={10} />
                    Select Template First
                  </span>
                )}
              </div>
              
              <div className={cn("flex flex-col gap-2", !activeTemplate && "opacity-40 grayscale pointer-events-none select-none")}>
                {filteredMatches.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-app-border rounded-lg">
                    <p className="text-app-muted text-[11px]">No matches found for the current filters.</p>
                  </div>
                ) : (
                  filteredMatches.map(m => (
                    <div key={m.id} className="relative group">
                      <div 
                        onClick={() => activeTemplate && setEditorMatch(m)}
                        className={cn(
                          "p-3 rounded-lg border text-left flex items-center justify-between transition-all",
                          activeMatch?.id === m.id
                            ? "bg-app-accent/10 border-app-accent text-app-text shadow-[0_0_15px_rgba(var(--app-accent-rgb),0.1)]"
                            : "bg-app-bg border-app-border hover:border-app-muted text-app-muted cursor-pointer"
                        )}
                      >
                        <div className="flex flex-col flex-1 gap-1">
                          <div className="flex justify-between items-center text-[10px] font-bold text-app-muted uppercase tracking-wider mb-1">
                            <span>{m.league}</span>
                            <span>
                              {new Date(m.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 flex items-center justify-center bg-white/5 rounded border border-app-border">
                                <img src={m.sport === 'tennis' ? m.player1?.flag : m.homeTeam?.logo} className="w-4 h-4 object-contain" alt="" />
                              </div>
                              <span className={cn("text-[13px] font-[600]", activeMatch?.id === m.id ? "text-app-text" : "text-app-text/90")}>
                                {m.sport === 'tennis' 
                                  ? `${m.player1?.name} vs ${m.player2?.name}`
                                  : `${m.homeTeam?.shortName} vs ${m.awayTeam?.shortName}`}
                              </span>
                            </div>
                            {activeMatch?.id === m.id && <Check size={16} className="text-app-accent ml-2 shrink-0" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeLeftTab === 'templates' && (
          <div className="p-4 flex flex-col gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full text-[11px] font-[700] text-app-accent border border-app-accent/30 hover:bg-app-accent/10 px-3 py-2.5 rounded transition-all flex items-center justify-center gap-2 uppercase tracking-wider mb-2"
            >
              <Check size={14} />
              Import JSON Template
            </button>
            <div className="flex flex-col gap-3">
              {tab2Templates.map((template: any) => (
                <div key={template.id} className="bg-app-bg border border-app-border rounded-lg overflow-hidden flex flex-col group hover:border-app-accent/50 transition-colors">
                  <div className="relative h-[120px] bg-app-card flex items-center justify-center p-2">
                    <img src={template.thumbnail} className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-lg" alt="" />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <span className="bg-app-bg/60 backdrop-blur text-app-text text-[9px] px-1.5 py-0.5 rounded font-mono border border-app-border uppercase font-bold tracking-wider">{template.ratio}</span>
                    </div>
                  </div>
                  <div className="p-3 text-left">
                    <h4 className="text-[12px] font-bold text-app-text mb-1 truncate">{template.name}</h4>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-app-muted">v{template.version || '1.0'} • Admin</span>
                    </div>
                    <button 
                       onClick={() => setEditorTemplate(template)}
                       className="w-full text-center py-1.5 text-[10px] font-bold text-app-accent bg-app-accent/10 hover:bg-app-accent/20 rounded uppercase tracking-wider transition-colors"
                    >
                       Use Template
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
          </div>
        )}
      </div>
    </div>
  );
};
