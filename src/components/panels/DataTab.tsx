import React from "react";
import { cn } from "../../lib/utils";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "../../lib/i18n";
import { resolveBoundData, isAutoResolved } from "../../lib/templateEngine";
import { resolveAssetPath } from "../../lib/assetResolver";

interface DataTabProps {
  match: any;
  template: any;
  activeSession: any;
  elementsWithBinding: any[];
  manualInputs: Record<string, string>;
  setManualInput: (key: string, value: string) => void;
  setHoveredElementId: (id: string | null) => void;
  commitHistory: () => void;
  elementOverrides: any;
}

export const DataTab: React.FC<DataTabProps> = ({
  match,
  template,
  activeSession,
  elementsWithBinding,
  manualInputs,
  setManualInput,
  setHoveredElementId,
  commitHistory,
  elementOverrides
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-4 overflow-y-auto w-full h-full pb-10 flex flex-col gap-5">
      {match ? (
        <>
          {/* Single Context Card built using table-style layout */}
          <div className="flex flex-col bg-app-card rounded-xl border border-app-border overflow-hidden shadow-sm">
            {/* Competition Header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-app-border/40 bg-black/[0.02] dark:bg-white/[0.02]">
              <span className="bg-app-accent/15 text-app-accent px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-widest shrink-0">
                {match.sport}
              </span>
              {match.competition?.logo && (
                <div className="w-4 h-4 flex items-center justify-center shrink-0 rounded-[3px] bg-black/5 dark:bg-white/5 border border-app-border/40 overflow-hidden shadow-sm">
                  <img 
                    src={resolveAssetPath(match.competition.logo, { packId: "", templateId: "" })} 
                    className="w-full h-full object-contain" 
                    alt="" 
                  />
                </div>
              )}
              <span className="font-semibold text-[11px] text-app-text truncate">
                {match.competition?.name || match.league}
              </span>
              {(match.competition?.flag || '') && (
                <img 
                  src={resolveAssetPath(match.competition.flag || '', { packId: "", templateId: "" })} 
                  className="w-[14px] h-[10px] object-cover rounded-[1px] opacity-85 shadow-[0_0_0_1px_rgba(0,0,0,0.1)] shrink-0 ml-auto" 
                  alt="" 
                />
              )}
            </div>

            {/* Match Info Area */}
            {match.sport === 'football' && match.homeTeam && match.awayTeam && (
              <div className="flex relative">
                <div className="flex flex-col gap-2 p-3 flex-1 min-w-0 pr-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        {(match.homeTeam.assets?.logo || match.homeTeam.logo) && (
                          <img 
                            src={resolveAssetPath(match.homeTeam.assets?.logo || match.homeTeam.logo || "", { packId: "", templateId: "" })} 
                            className="w-full h-full object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]" 
                            alt="" 
                          />
                        )}
                      </div>
                      <span className="text-[13px] font-medium text-app-text truncate">
                        {match.homeTeam.name || match.homeTeam.id}
                      </span>
                    </div>
                    {(match.status !== 'NS' && match.score) && (
                      <span className="font-bold text-[15px] text-app-text shrink-0">
                        {typeof match.score === 'object' ? match.score?.ft?.[0] : match.score?.split('-')[0]?.trim()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        {(match.awayTeam.assets?.logo || match.awayTeam.logo) && (
                          <img 
                            src={resolveAssetPath(match.awayTeam.assets?.logo || match.awayTeam.logo || "", { packId: "", templateId: "" })} 
                            className="w-full h-full object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]" 
                            alt="" 
                          />
                        )}
                      </div>
                      <span className="text-[13px] font-medium text-app-text truncate">
                        {match.awayTeam.name || match.awayTeam.id}
                      </span>
                    </div>
                    {(match.status !== 'NS' && match.score) && (
                      <span className="font-bold text-[15px] text-app-text shrink-0">
                        {typeof match.score === 'object' ? match.score?.ft?.[1] : match.score?.split('-')[1]?.trim()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-3 w-[6rem] shrink-0 text-center border-l border-app-border/40 bg-black/[0.02] dark:bg-white/[0.02]">
                  {match.round && (
                    <span className="text-[9px] font-medium text-app-muted truncate w-full mb-1">{match.round}</span>
                  )}
                  {match.status === 'NS' || !match.score ? (
                    <>
                      <span className="text-[13px] font-semibold text-app-text leading-tight">{match.time || '-:-'}</span>
                      <span className="text-[10px] font-medium text-app-muted mt-0.5 text-center leading-tight">
                        {new Date(match.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-medium text-app-muted text-center mb-0.5 leading-tight">
                        {new Date(match.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className={cn(
                        "text-[11px] font-bold tracking-wide mt-0.5",
                        (match.status === 'LIVE' || match.isLive) ? "text-red-500 uppercase" : "text-app-muted/80 uppercase"
                      )}>
                        {(match.status === 'LIVE' || match.isLive) ? 'LIVE' : (match.status === 'FINISHED' || match.status === 'FT' || match.status === 'Chung cuộc' ? 'FT' : match.status)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {match.sport === 'tennis' && match.player1 && match.player2 && (
              <div className="flex relative">
                <div className="flex flex-col gap-2 p-3 flex-1 min-w-0 pr-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-5 h-4 flex items-center justify-center shrink-0 overflow-hidden rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.1)]">
                        {(match.player1.flag) && (
                          <img 
                            src={resolveAssetPath(match.player1.flag || "", { packId: "", templateId: "" })} 
                            className="w-full h-full object-cover" 
                            alt="" 
                          />
                        )}
                      </div>
                      <span className="text-[13px] font-medium text-app-text truncate">
                        {match.player1.name || match.player1.id}
                      </span>
                    </div>
                    {(match.status !== 'NS' && match.score) && (
                      <span className="font-bold text-[14px] text-app-text shrink-0">
                        {typeof match.score === 'string' ? match.score.split('-')[0]?.trim() : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-5 h-4 flex items-center justify-center shrink-0 overflow-hidden rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.1)]">
                        {(match.player2.flag) && (
                          <img 
                            src={resolveAssetPath(match.player2.flag || "", { packId: "", templateId: "" })} 
                            className="w-full h-full object-cover" 
                            alt="" 
                          />
                        )}
                      </div>
                      <span className="text-[13px] font-medium text-app-text truncate">
                        {match.player2.name || match.player2.id}
                      </span>
                    </div>
                    {(match.status !== 'NS' && match.score) && (
                      <span className="font-bold text-[14px] text-app-text shrink-0">
                        {typeof match.score === 'string' ? match.score.split('-')[1]?.trim() : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-3 w-[6rem] shrink-0 text-center border-l border-app-border/40 bg-black/[0.02] dark:bg-white/[0.02]">
                  {match.round && (
                    <span className="text-[9px] font-medium text-app-muted truncate w-full mb-1">{match.round}</span>
                  )}
                  {match.status === 'NS' || !match.score ? (
                    <>
                      <span className="text-[13px] font-semibold text-app-text leading-tight">{match.time || '-:-'}</span>
                      <span className="text-[10px] font-medium text-app-muted mt-0.5 text-center leading-tight">
                        {new Date(match.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-medium text-app-muted text-center mb-0.5 leading-tight">
                        {new Date(match.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className={cn(
                        "text-[11px] font-bold tracking-wide mt-0.5",
                        (match.status === 'LIVE' || match.isLive) ? "text-red-500 uppercase" : "text-app-muted/80 uppercase"
                      )}>
                        {(match.status === 'LIVE' || match.isLive) ? 'LIVE' : (match.status === 'FINISHED' || match.status === 'FT' || match.status === 'Chung cuộc' ? 'FT' : match.status)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-ui-xs text-app-muted font-normal mb-2.5 pb-2 border-b border-app-border/30">{t.panels.fields.details}</h3>
            <div className="flex flex-col gap-0">
              {match.venue && (
                <div className="flex justify-between items-center py-2.5 border-b border-app-border/20">
                  <span className="text-ui-xs text-app-muted">{t.panels.fields.venue}</span>
                  <span className="text-ui-xs text-app-text font-medium text-right max-w-[60%] truncate">{match.venue}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2.5 border-b border-app-border/20">
                <span className="text-ui-xs text-app-muted">{t.panels.fields.date}</span>
                <span className="text-ui-xs text-app-text font-medium">{new Date(match.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              {(match.time || match.date) && (
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-ui-xs text-app-muted">{t.panels.fields.kickoff}</span>
                  <span className="text-ui-xs text-app-text font-medium">{match.time ? `${match.time} ${match.timezone || ''}` : `${new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} GMT`}</span>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-app-muted text-ui-sm italic border border-app-border border-dashed p-5 rounded-lg bg-app-card/30">
          No match selected. Canvas will show placeholder variables.
        </div>
      )}

      {/* Data bindings list */}
      <div>
        <h3 className="text-ui-xs text-app-muted font-normal mb-3">{t.panels.fields.dataSources}</h3>
        <div className="flex flex-col gap-2">
          {elementsWithBinding.map(element => {
            const resolverContext = {
              packId: activeSession?.packId || "_default_pack",
              templateId: template?.id || "fallback"
            };
            const resolved = resolveBoundData(element, match, manualInputs, elementOverrides[element.id], resolverContext);
            let displayVal = 'N/A';

            let rawBoundValue: any;
            if (element.dataKey && match) {
              const cleanKey = element.dataKey.replace(/^match\./, '');
              if (cleanKey.endsWith('.colors.primary')) {
                rawBoundValue = cleanKey.split('.').reduce((acc: any, part: string) => acc && acc[part], match) ||
                  cleanKey.replace('.colors.primary', '.color').split('.').reduce((acc: any, part: string) => acc && acc[part], match);
              } else {
                rawBoundValue = cleanKey.split('.').reduce((acc: any, part: string) => acc && acc[part], match);
              }
              if (rawBoundValue !== undefined && rawBoundValue !== null) {
                displayVal = String(rawBoundValue);
              }
            }

            if (displayVal === 'N/A') {
              if (element.type.toLowerCase() === 'text') {
                displayVal = resolved.text;
              } else if (element.type.toLowerCase() === 'image' || element.type.toLowerCase() === 'backgroundimage') {
                displayVal = resolved.src ? '[Image]' : 'N/A';
              } else if (resolved.fill && typeof resolved.fill === 'string' && resolved.fill.startsWith('#')) {
                displayVal = resolved.fill;
              } else if (resolved.stroke && typeof resolved.stroke === 'string' && resolved.stroke.startsWith('#')) {
                displayVal = resolved.stroke;
              }
            }

            const isAuto = isAutoResolved(element.dataKey!, match);

            return (
              <div
                key={`bind-${element.id}`}
                className="flex flex-col gap-2 text-ui-sm p-3 rounded-lg border border-app-border bg-app-card hover:border-app-accent/40 transition-all shadow-sm"
                onMouseEnter={() => setHoveredElementId(element.id)}
                onMouseLeave={() => setHoveredElementId(null)}
              >
                <div className="flex justify-between items-center">
                  <span className="text-app-muted font-mono text-ui-xs whitespace-nowrap overflow-hidden text-ellipsis mr-2">
                    {`{{${element.dataKey}}}`}
                  </span>
                  {isAuto && (
                    <span className="text-app-accent text-ui-xs font-medium text-right truncate max-w-[120px]" title={displayVal}>
                      {displayVal || "N/A"}
                    </span>
                  )}
                </div>
                {!isAuto && (
                  <input
                    type="text"
                    placeholder={`Enter ${element.dataKey}...`}
                    value={manualInputs[element.dataKey!] || ""}
                    onChange={(e) => {
                      setManualInput(element.dataKey!, e.target.value);
                      commitHistory();
                    }}
                    className="w-full bg-app-bg border border-app-border rounded-md p-2 text-app-text outline-none focus:border-app-accent text-ui-sm mt-0.5 h-8"
                  />
                )}
              </div>
            );
          })}
          {elementsWithBinding.length === 0 && (
            <div className="text-ui-xs text-app-muted italic text-center p-3">No bound variables in template</div>
          )}
        </div>
      </div>
    </div>
  );
};
