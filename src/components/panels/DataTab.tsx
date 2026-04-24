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
    <div className="flex flex-col gap-5">
      {match ? (
        <>
          {/* Competition Header (Optional, but user image 1 shows a clean card) */}
          <div className="flex flex-col gap-2">
            {/* Match Info Card: MUN vs MCI style */}
            <div className="flex flex-col bg-app-card rounded-2xl border border-app-border overflow-hidden shadow-sm aspect-video">
              <div className="flex-1 flex flex-col items-center justify-center pt-2">
                <div className="flex items-center justify-between w-full px-8 flex-1">
                  {/* Home Team */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 flex items-center justify-center">
                      {(match.homeTeam?.assets?.logo || match.homeTeam?.logo || (match.sport === 'tennis' && match.player1?.flag)) && (
                        <img 
                          src={resolveAssetPath(match.sport === 'tennis' ? match.player1?.flag || "" : match.homeTeam?.assets?.logo || match.homeTeam?.logo || "", { packId: "", templateId: "" })} 
                          className="w-full h-full object-contain drop-shadow-md" 
                          alt="" 
                        />
                      )}
                    </div>
                    <span className="text-[14px] font-bold text-app-text tracking-widest uppercase">
                      {match.sport === 'tennis' ? match.player1?.name : (match.homeTeam?.shortName || match.homeTeam?.id)}
                    </span>
                  </div>

                  {/* Center Info */}
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[32px] font-bold text-app-text leading-none tracking-tight">
                      {match.status === 'NS' || !match.status ? match.time : (typeof match.score === 'object' ? `${match.score?.ft?.[0]}:${match.score?.ft?.[1]}` : match.score)}
                    </span>
                    <span className="text-[12px] text-app-muted font-bold mt-2 uppercase tracking-[0.2em]">
                      {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 flex items-center justify-center">
                      {(match.awayTeam?.assets?.logo || match.awayTeam?.logo || (match.sport === 'tennis' && match.player2?.flag)) && (
                        <img 
                          src={resolveAssetPath(match.sport === 'tennis' ? match.player2?.flag || "" : match.awayTeam?.assets?.logo || match.awayTeam?.logo || "", { packId: "", templateId: "" })} 
                          className="w-full h-full object-contain drop-shadow-md" 
                          alt="" 
                        />
                      )}
                    </div>
                    <span className="text-[14px] font-bold text-app-text tracking-widest uppercase">
                      {match.sport === 'tennis' ? match.player2?.name : (match.awayTeam?.shortName || match.awayTeam?.id)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="h-[2.75rem] border-t border-app-border/40 px-5 flex items-center justify-between bg-black/[0.01] dark:bg-white/[0.01]">
                <span className="text-[11px] font-bold text-app-muted tracking-wider">{match.round}</span>
                <span className="text-[11px] font-medium text-app-muted truncate max-w-[60%]">{match.venue}</span>
              </div>
            </div>

            <div className="mt-2">
              <h3 className="text-ui-xs text-app-muted font-normal mb-1 pb-1.5 border-b border-app-border/30">{t.panels.fields.details}</h3>
              <div className="flex flex-col">
                {match.venue && (
                  <div className="flex justify-between items-center py-2.5 border-b border-app-border/10">
                    <span className="text-ui-xs text-app-muted">{t.panels.fields.venue}</span>
                    <span className="text-ui-xs text-app-text font-medium text-right max-w-[60%] truncate">{match.venue}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2.5 border-b border-app-border/10">
                  <span className="text-ui-xs text-app-muted">{t.panels.fields.date}</span>
                  <span className="text-ui-xs text-app-text font-medium">{new Date(match.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                {(match.time || match.date) && (
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-ui-xs text-app-muted">{t.panels.fields.kickoff}</span>
                    <span className="text-ui-xs text-app-text font-medium">{match.time ? `${match.time}` : `${new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</span>
                  </div>
                )}
              </div>
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
                <div className="flex flex-col gap-1.5">
                  <span className="text-app-muted font-mono text-[10px] truncate" title={`{{${element.dataKey}}}`}>
                    {`{{${element.dataKey}}}`}
                  </span>
                  {isAuto && (
                    <span className="text-app-accent text-ui-sm font-bold truncate" title={displayVal}>
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
