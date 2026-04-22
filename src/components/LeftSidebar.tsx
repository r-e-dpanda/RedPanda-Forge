import React from "react";
import { useEditorStore } from "../stores/editorStore";
import { Check, LayoutTemplate } from "lucide-react";
import { cn } from "../lib/utils";
import { MOCK_MATCHES, MOCK_TEMPLATES } from "../lib/mockData";
import { Sport, Ratio, Match, Template } from "../types/template";
import { useTranslation } from "../lib/i18n";
import { resolveAssetPath } from "../lib/assetResolver";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LeftSidebarProps {
  selectedSport: Sport;
  selectedRatio: Ratio | "All";
  selectedLeague: string;
  activeLeftTab: 'matches' | 'templates';
  setActiveLeftTab: (val: 'matches' | 'templates') => void;
  setSelectedRatio: (val: Ratio | "All") => void;
  templates: Template[];
  setEditorTemplate: (template: Template) => void;
  activeTemplate: Template | null;
  activeMatch: Match | null;
  setEditorMatch: (match: Match) => void;
  setIsModalOpen: (isOpen: boolean) => void;
}

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
}: LeftSidebarProps) => {
  const { t } = useTranslation();
  const filteredMatches = MOCK_MATCHES.filter(m =>
    m.sport === selectedSport &&
    (selectedLeague === "All" || m.league === selectedLeague)
  );
  const filteredTemplates = templates.filter((t: any) => t.sport === selectedSport && (selectedRatio === "All" || t.ratio === selectedRatio));
  const tab2Templates = templates.filter((t: any) => t.sport === selectedSport);

  return (
    <div className="w-[17.5rem] bg-app-sidebar border-r border-app-border flex flex-col shrink-0 z-10 font-sans relative">

      {/* ── Tab bar ─────────────────────────────────────────────────── */}
      <div className="flex border-b border-app-border bg-app-sidebar h-[2.75rem] shrink-0">
        <button
          onClick={() => setActiveLeftTab('matches')}
          className={cn(
            "flex-1 text-ui-sm font-medium transition-colors border-b-2",
            activeLeftTab === 'matches'
              ? "border-app-accent text-app-text"
              : "border-transparent text-app-muted hover:text-app-text hover:bg-app-card"
          )}
        >
          {t.sidebar.tabs.matches}
        </button>
        <button
          onClick={() => setActiveLeftTab('templates')}
          className={cn(
            "flex-1 text-ui-sm font-medium transition-colors border-b-2",
            activeLeftTab === 'templates'
              ? "border-app-accent text-app-text"
              : "border-transparent text-app-muted hover:text-app-text hover:bg-app-card"
          )}
        >
          {t.sidebar.tabs.templates}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ── Matches tab ─────────────────────────────────────────── */}
        {activeLeftTab === 'matches' && (
          <div className="p-4 flex flex-col gap-4 relative h-full">

            {/* Filters */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 w-full">
                <span className="text-ui-xs text-app-muted font-normal">{t.sidebar.filters.ratio}</span>
                <Select value={selectedRatio} onValueChange={(val) => setSelectedRatio(val as Ratio | "All")}>
                  <SelectTrigger className="w-full bg-app-card">
                    <SelectValue placeholder="Select ratio..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">{t.sidebar.filters.allRatios}</SelectItem>
                    <SelectItem value="16:9">16:9 Landscape</SelectItem>
                    <SelectItem value="9:16">9:16 Portrait</SelectItem>
                    <SelectItem value="1:1">1:1 Square</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <span className="text-ui-xs text-app-muted font-normal">{t.sidebar.filters.template}</span>
                <Select 
                  value={filteredTemplates.some((t: any) => t.id === activeTemplate?.id) ? (activeTemplate?.id || "") : ""} 
                  onValueChange={(val) => {
                    const tpl = templates.find((t: any) => t.id === val);
                    if (tpl) setEditorTemplate(tpl);
                  }}
                  disabled={filteredTemplates.length === 0}
                >
                  <SelectTrigger className="w-full bg-app-card">
                    <SelectValue placeholder={filteredTemplates.length === 0 ? "No template found" : "Select template..."}>
                      {activeTemplate ? `${activeTemplate.name} (${activeTemplate.ratio})` : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTemplates.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>{`${t.name} (${t.ratio})`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Match list */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-ui-xs text-app-muted font-normal">{t.sidebar.matches.header}</h3>
                {!activeTemplate && (
                  <span className="text-ui-xs text-app-accent flex items-center gap-1 animate-pulse">
                    <LayoutTemplate size={12} />
                    {t.sidebar.matches.selectTemplateFirst}
                  </span>
                )}
              </div>

              <div className={cn("flex flex-col gap-2", !activeTemplate && "opacity-40 grayscale pointer-events-none select-none")}>
                {filteredMatches.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-app-border rounded-lg">
                    <p className="text-app-muted text-ui-xs">{t.sidebar.matches.noMatchesFound}</p>
                  </div>
                ) : (
                  filteredMatches.map(m => (
                    <div
                      key={m.id}
                      onClick={() => activeTemplate && setEditorMatch(m)}
                      className={cn(
                        "flex flex-col bg-app-card rounded-xl border overflow-hidden transition-all cursor-pointer shadow-sm hover:shadow-md h-24 shrink-0",
                        activeMatch?.id === m.id ? "border-app-accent ring-1 ring-app-accent/20" : "border-app-border"
                      )}
                    >
                      {/* Main Matchup Area */}
                      <div className="flex items-center justify-between px-3 h-[4.25rem] w-full">
                        {/* Home */}
                        <div className="flex flex-col items-center justify-center gap-1.5 flex-1 min-w-0">
                          <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                            <img src={resolveAssetPath(m.sport === 'tennis' ? m.player1?.flag || "" : m.homeTeam?.assets?.logo || m.homeTeam?.logo || "", { packId: "", templateId: "" })} className="w-full h-full object-contain drop-shadow-sm" alt="" />
                          </div>
                          <span className="text-[11px] font-semibold text-app-text truncate w-full text-center">
                            {m.sport === 'tennis' ? m.player1?.name : (m.homeTeam?.shortName || m.homeTeam?.name || m.homeTeam?.id)}
                          </span>
                        </div>

                        {/* Center: Score / Time */}
                        <div className="flex flex-col items-center justify-center px-0.5 shrink-0 w-[5.5rem]">
                          {m.status === 'NS' || !m.status ? (
                            <>
                              <span className="text-[22px] font-bold text-app-text leading-none tracking-tight">{m.time || '-:-'}</span>
                              <span className="text-[10px] text-app-muted font-medium mt-1 text-center leading-tight lowercase">
                                {new Date(m.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center justify-center gap-2 text-[22px] font-bold text-app-text leading-none tracking-tight">
                                <span>{typeof m.score === 'object' ? m.score?.ft?.[0] : m.score?.split('-')[0]?.trim() || "-"}</span>
                                <span className="text-app-muted/40 font-medium text-[16px] mb-0.5">-</span>
                                <span>{typeof m.score === 'object' ? m.score?.ft?.[1] : m.score?.split('-')[1]?.trim() || "-"}</span>
                              </div>
                              <span className={cn(
                                "text-[9px] font-medium mt-1.5 text-center leading-tight", 
                                (m.status === 'LIVE' || m.isLive) ? "text-red-500 font-bold uppercase" : "text-app-muted/80 lowercase"
                              )}>
                                {
                                  (m.status === 'LIVE' || m.isLive) ? "LIVE" :
                                  (m.status === 'FT' || m.status === 'FINISHED' || m.status === 'Finished' || m.status === 'Chung cuộc') ? 
                                    `${new Date(m.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).replace(',', '')} - FT` : 
                                    m.status
                                }
                              </span>
                            </>
                          )}
                        </div>

                        {/* Away */}
                        <div className="flex flex-col items-center justify-center gap-1.5 flex-1 min-w-0">
                          <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                            <img src={resolveAssetPath(m.sport === 'tennis' ? m.player2?.flag || "" : m.awayTeam?.assets?.logo || m.awayTeam?.logo || "", { packId: "", templateId: "" })} className="w-full h-full object-contain drop-shadow-sm" alt="" />
                          </div>
                          <span className="text-[11px] font-semibold text-app-text truncate w-full text-center">
                            {m.sport === 'tennis' ? m.player2?.name : (m.awayTeam?.shortName || m.awayTeam?.name || m.awayTeam?.id)}
                          </span>
                        </div>
                      </div>

                      {/* Footer: Competition */}
                      <div className="bg-black/[0.02] dark:bg-white/[0.02] border-t border-app-border/40 px-3 flex-1 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          {m.competition?.logo && (
                            <img src={resolveAssetPath(m.competition.logo, { packId: "", templateId: "" })} className="w-3.5 h-3.5 object-contain opacity-70 shrink-0" alt="" />
                          )}
                          <span className="text-[9px] font-medium text-app-muted truncate" title={m.competition?.name || m.league}>
                            {m.competition?.name || m.league}
                          </span>
                        </div>
                        {m.round && (
                          <span className="text-[9px] text-app-muted/60 font-medium shrink-0 ml-2 border-l border-app-border/30 pl-2">
                            {m.round}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Templates tab ────────────────────────────────────────── */}
        {activeLeftTab === 'templates' && (
          <div className="p-4 flex flex-col gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full text-ui-xs font-medium text-app-accent border border-app-accent/30 hover:bg-app-accent/10 px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Check size={14} />
              {t.sidebar.templates.importBtn}
            </button>

            <div className="flex flex-col gap-3">
              {tab2Templates.map((template: any) => (
                <div
                  key={template.id}
                  className="bg-app-bg border border-app-border rounded-xl overflow-hidden flex flex-col group hover:border-app-accent/40 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative h-[120px] bg-app-card flex items-center justify-center p-3">
                    <img
                      src={template.thumbnail}
                      className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-xl opacity-95 transition-transform group-hover:scale-[1.03]"
                      alt=""
                    />
                    <div className="absolute top-2 right-2">
                      <span className="bg-app-bg/80 backdrop-blur-md text-app-muted text-ui-xs px-2 py-0.5 rounded border border-app-border font-mono">
                        {template.ratio}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 text-left">
                    <h4 className="text-ui-sm font-medium text-app-text mb-0.5 truncate">{template.name}</h4>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-ui-xs text-app-muted">v{template.version || '1.0'} · Redpanda</span>
                    </div>
                    <button
                      onClick={() => setEditorTemplate(template)}
                      className="w-full text-center py-1.5 text-ui-xs font-medium text-app-accent bg-app-accent/10 hover:bg-app-accent/20 rounded-lg transition-all"
                    >
                      {t.sidebar.templates.useTemplate}
                    </button>
                  </div>
                </div>
              ))}
              {tab2Templates.length === 0 && (
                <div className="text-ui-xs text-app-muted p-4 border border-dashed border-app-border rounded text-center">
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
