import React from "react";
import { useEditorStore } from "../stores/editorStore";
import { Check, LayoutTemplate } from "lucide-react";
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

  return (
    <div className="w-[280px] bg-app-sidebar border-r border-app-border flex flex-col shrink-0 z-10 font-sans relative">

      {/* ── Tab bar ─────────────────────────────────────────────────── */}
      <div className="flex border-b border-app-border bg-app-sidebar h-[44px] shrink-0">
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
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-ui-xs text-app-muted shrink-0 w-16">{t.sidebar.filters.ratio}</span>
                <select
                  value={selectedRatio}
                  onChange={(e) => setSelectedRatio(e.target.value as Ratio | "All")}
                  className="bg-app-bg border border-app-border rounded px-2 py-1.5 flex-1 text-app-text outline-none focus:border-app-accent text-ui-xs"
                >
                  <option value="All">{t.sidebar.filters.allRatios}</option>
                  <option value="16:9">16:9 Landscape</option>
                  <option value="9:16">9:16 Portrait</option>
                  <option value="1:1">1:1 Square</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-ui-xs text-app-muted shrink-0 w-16">{t.sidebar.filters.template}</span>
                <select
                  value={filteredTemplates.some((t: any) => t.id === activeTemplate?.id) ? (activeTemplate?.id || "") : ""}
                  onChange={(e) => {
                    const tpl = templates.find((t: any) => t.id === e.target.value);
                    if (tpl) setEditorTemplate(tpl);
                  }}
                  className="bg-app-bg border border-app-border rounded px-2 py-1.5 flex-1 text-app-text outline-none focus:border-app-accent text-ui-xs truncate"
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
                        "p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer",
                        activeMatch?.id === m.id
                          ? "bg-app-accent/10 border-app-accent text-app-text shadow-[0_0_16px_rgba(var(--app-accent-rgb),0.10)]"
                          : "bg-app-bg border-app-border hover:border-app-muted text-app-muted"
                      )}
                    >
                      <div className="flex flex-col flex-1 gap-1.5">
                        {/* League + date row */}
                        <div className="flex justify-between items-center">
                          <span className="text-ui-xs text-app-muted">{m.league}</span>
                          <span className="text-ui-xs text-app-muted">
                            {new Date(m.date).toLocaleDateString()}
                          </span>
                        </div>
                        {/* Teams row */}
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 flex items-center justify-center bg-white/5 rounded border border-app-border shrink-0">
                            <img
                              src={
                                m.sport === 'tennis'
                                  ? resolveAssetPath(m.player1?.flag || "", { packId: "", templateId: "" })
                                  : resolveAssetPath(m.homeTeam?.assets?.logo || "", { packId: "", templateId: "" })
                              }
                              className="w-4 h-4 object-contain opacity-90"
                              alt=""
                            />
                          </div>
                          <span className={cn(
                            "text-ui-sm font-medium truncate flex-1",
                            activeMatch?.id === m.id ? "text-app-text" : "text-app-text/80"
                          )}>
                            {m.sport === 'tennis'
                              ? `${m.player1?.name} vs ${m.player2?.name}`
                              : `${m.homeTeam?.shortName || m.homeTeam?.id} vs ${m.awayTeam?.shortName || m.awayTeam?.id}`}
                          </span>
                          {activeMatch?.id === m.id && <Check size={14} className="text-app-accent ml-1 shrink-0" />}
                        </div>
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
