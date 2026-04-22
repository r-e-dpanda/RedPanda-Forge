import React from "react";
import { useEditorStore } from "../stores/editorStore";
import { Folder, Image as ImageIcon, Users, LayoutTemplate, Settings, Check, Files, Wand2 } from "lucide-react";
import { cn } from "../lib/utils";
import { MOCK_MATCHES, MOCK_TEMPLATES } from "../lib/mockData";
import { Sport, Ratio } from "../types/template";
import { useTranslation } from "../lib/i18n";
import { resolveAssetPath } from "../lib/assetResolver";

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
  const { t } = useTranslation();
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
      <div className="flex border-b border-app-border bg-app-sidebar h-[54px] shrink-0 font-sans">
        <button 
          onClick={() => setActiveLeftTab('matches')}
          className={cn(
            "flex-1 text-ui-base font-bold transition-colors border-b-[2px]",
            activeLeftTab === 'matches' ? "border-app-accent text-app-text" : "border-transparent text-app-muted hover:text-app-text hover:bg-app-card"
          )}
        >
          {t.sidebar.tabs.matches}
        </button>
        <button 
          onClick={() => setActiveLeftTab('templates')}
          className={cn(
            "flex-1 text-ui-base font-bold transition-colors border-b-[2px]",
            activeLeftTab === 'templates' ? "border-app-accent text-app-text" : "border-transparent text-app-muted hover:text-app-text hover:bg-app-card"
          )}
        >
          {t.sidebar.tabs.templates}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeLeftTab === 'matches' && (
          <div className="p-5 flex flex-col gap-5 relative h-full">
            <div className="flex justify-between items-center text-ui-base">
              <span className="text-app-muted font-bold tracking-tight">{t.sidebar.filters.ratio}</span>
              <select 
                value={selectedRatio} 
                onChange={(e) => setSelectedRatio(e.target.value as Ratio | "All")}
                className="bg-app-bg border border-app-border rounded px-2 py-1.5 flex-1 ml-4 text-app-text outline-none focus:border-app-accent text-ui-sm"
              >
                <option value="All">{t.sidebar.filters.allRatios}</option>
                <option value="16:9">16:9 Landscape</option>
                <option value="9:16">9:16 Portrait</option>
                <option value="1:1">1:1 Square</option>
              </select>
            </div>

            <div className="flex justify-between items-center text-ui-base">
              <span className="text-app-muted font-bold tracking-tight">{t.sidebar.filters.template}</span>
              <select 
                value={filteredTemplates.some((t: any) => t.id === activeTemplate?.id) ? (activeTemplate?.id || "") : ""} 
                onChange={(e) => {
                  const tpl = templates.find((t: any) => t.id === e.target.value);
                  if (tpl) setEditorTemplate(tpl);
                }}
                className="bg-app-bg border border-app-border rounded px-2 py-1.5 flex-1 ml-4 text-app-text outline-none focus:border-app-accent text-ui-sm max-w-[160px] truncate"
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

            <div className="flex flex-col gap-3 relative">
              <div className="flex items-center justify-between mt-3 mb-1">
                <h3 className="text-ui-sm font-bold text-app-muted">{t.sidebar.matches.header}</h3>
                {!activeTemplate && (
                  <span className="text-[11px] text-app-accent font-bold flex items-center gap-1.5 animate-pulse">
                    <LayoutTemplate size={13} />
                    {t.sidebar.matches.selectTemplateFirst}
                  </span>
                )}
              </div>
              
              <div className={cn("flex flex-col gap-2.5", !activeTemplate && "opacity-40 grayscale pointer-events-none select-none")}>
                {filteredMatches.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-app-border rounded-lg">
                    <p className="text-app-muted text-[13px]">{t.sidebar.matches.noMatchesFound}</p>
                  </div>
                ) : (
                  filteredMatches.map(m => (
                    <div key={m.id} className="relative group">
                      <div 
                        onClick={() => activeTemplate && setEditorMatch(m)}
                        className={cn(
                          "p-4 rounded-xl border text-left flex items-center justify-between transition-all",
                          activeMatch?.id === m.id
                            ? "bg-app-accent/10 border-app-accent text-app-text shadow-[0_0_20px_rgba(var(--app-accent-rgb),0.12)]"
                            : "bg-app-bg border-app-border hover:border-app-muted text-app-muted cursor-pointer"
                        )}
                      >
                        <div className="flex flex-col flex-1 gap-1.5">
                          <div className="flex justify-between items-center text-ui-xs font-bold text-app-muted mb-1">
                            <span>{m.league}</span>
                            <span>
                              {new Date(m.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-7 h-7 flex items-center justify-center bg-white/5 rounded-md border border-app-border">
                                <img 
                                  src={
                                    m.sport === 'tennis' 
                                      ? resolveAssetPath(m.player1?.flag || "", {packId: "", templateId: ""})
                                      : resolveAssetPath(m.homeTeam?.assets?.logo || "", {packId: "" , templateId: ""})
                                  } 
                                  className="w-5 h-5 object-contain opacity-90" 
                                  alt="" 
                                />
                              </div>
                              <span className={cn("text-ui-base font-[700] tracking-tight", activeMatch?.id === m.id ? "text-app-text" : "text-app-text/90")}>
                                {m.sport === 'tennis' 
                                  ? `${m.player1?.name} vs ${m.player2?.name}`
                                  : `${m.homeTeam?.shortName || m.homeTeam?.id} vs ${m.awayTeam?.shortName || m.awayTeam?.id}`}
                              </span>
                            </div>
                            {activeMatch?.id === m.id && <Check size={18} className="text-app-accent ml-2 shrink-0" />}
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
          <div className="p-5 flex flex-col gap-5">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full text-ui-sm font-bold text-app-accent border border-app-accent/30 hover:bg-app-accent/10 px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2.5 mb-2 shadow-sm"
            >
              <Check size={16} />
              {t.sidebar.templates.importBtn}
            </button>
            <div className="flex flex-col gap-4">
              {tab2Templates.map((template: any) => (
                <div key={template.id} className="bg-app-bg border border-app-border rounded-xl overflow-hidden flex flex-col group hover:border-app-accent/50 transition-all hover:shadow-lg">
                  <div className="relative h-[130px] bg-app-card flex items-center justify-center p-3">
                    <img src={template.thumbnail} className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-2xl opacity-95 transition-transform group-hover:scale-105" alt="" />
                    <div className="absolute top-2.5 right-2.5 flex gap-1">
                      <span className="bg-app-bg/70 backdrop-blur-md text-app-text text-ui-xs px-2 py-1 rounded-md font-mono border border-app-border font-bold">{template.ratio}</span>
                    </div>
                  </div>
                  <div className="p-4 text-left">
                    <h4 className="text-[13.5px] font-bold text-app-text mb-1 truncate tracking-tight">{template.name}</h4>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[12px] text-app-muted">v{template.version || '1.0'} • REDPANDA</span>
                    </div>
                    <button 
                       onClick={() => setEditorTemplate(template)}
                       className="w-full text-center py-2 text-ui-sm font-bold text-app-accent bg-app-accent/10 hover:bg-app-accent/20 rounded-lg transition-all"
                    >
                       {t.sidebar.templates.useTemplate}
                    </button>
                  </div>
                </div>
              ))}
              {tab2Templates.length === 0 && (
                <div className="text-xs text-app-muted p-4 border border-dashed border-app-border rounded text-center">
                  {t.sidebar.templates.noTemplates}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
