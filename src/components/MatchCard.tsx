import React from "react";
import { cn } from "../lib/utils";
import { Match, Template } from "../types/template";
import { resolveAssetPath } from "../lib/assetResolver";

interface MatchCardProps {
  match: Match;
  activeTemplate: Template | null;
  activeMatch: Match | null;
  setEditorMatch: (match: Match) => void;
}

const formatPlayerName = (name?: string) => {
  if (!name) return "";
  const parts = name.split(" ");
  if (parts.length < 2) return name;
  const lastName = parts.pop();
  const initial = parts[0].charAt(0);
  return `${initial}. ${lastName}`;
};

const getMatchStatusDisplay = (m: Match) => {
  const isLive = m.status === 'LIVE' || m.isLive;
  if (!isLive) return m.time || "TBD";
  
  if (m.sport === 'tennis') {
    if (m.status && m.status.startsWith('Set')) return m.status;
    return "Set 1";
  }
  
  return 'LIVE';
};

const SoccerMatchCard = ({ match, isActive, onSelect }: { match: Match; isActive: boolean; onSelect: () => void }) => {
  const isFinished = match.status === 'FT' || match.status === 'FINISHED' || match.status === 'Finished' || match.status === 'Chung cuộc';
  const scoreParts = typeof match.score === 'string' ? match.score.split('-') : null;
  const homeScore = typeof match.score === 'object' ? match.score?.ft?.[0] : scoreParts?.[0]?.trim();
  const awayScore = typeof match.score === 'object' ? match.score?.ft?.[1] : scoreParts?.[1]?.trim();

  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex flex-col bg-app-card rounded-xl border overflow-hidden transition-all cursor-pointer shadow-sm hover:shadow-md min-h-24 shrink-0",
        isActive ? "border-app-accent ring-1 ring-app-accent/20" : "border-app-border"
      )}
    >
      <div className="flex flex-row h-full min-h-[90px]">
        {/* Teams stack */}
        <div className="flex-1 flex flex-col justify-center pl-3.5 pr-2 gap-2.5 border-r border-app-border/40 py-2">
          {/* Home Team */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                {(match.homeTeam?.assets?.logo || match.homeTeam?.logo) && (
                  <img 
                    src={resolveAssetPath(match.homeTeam?.assets?.logo || match.homeTeam?.logo || "", { packId: "", templateId: "" })} 
                    className="w-full h-full object-contain" 
                    alt="" 
                  />
                )}
              </div>
              <span className="text-[12px] font-bold text-app-text truncate uppercase tracking-tight">
                {match.homeTeam?.shortName || match.homeTeam?.name || match.homeTeam?.id}
              </span>
            </div>
            {(match.status !== 'NS' && match.score) && (
              <div className="flex items-center gap-1.5 shrink-0">
                {isFinished && Number(homeScore) > Number(awayScore) && (
                  <div className="w-0 h-0 border-t-[3.5px] border-t-transparent border-b-[3.5px] border-b-transparent border-l-[5px] border-l-app-text" />
                )}
                <span className="text-[13px] font-bold text-app-text w-5 text-right">{homeScore}</span>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                {(match.awayTeam?.assets?.logo || match.awayTeam?.logo) && (
                  <img 
                    src={resolveAssetPath(match.awayTeam?.assets?.logo || match.awayTeam?.logo || "", { packId: "", templateId: "" })} 
                    className="w-full h-full object-contain" 
                    alt="" 
                  />
                )}
              </div>
              <span className="text-[12px] font-bold text-app-text truncate uppercase tracking-tight">
                {match.awayTeam?.shortName || match.awayTeam?.name || match.awayTeam?.id}
              </span>
            </div>
            {(match.status !== 'NS' && match.score) && (
              <div className="flex items-center gap-1.5 shrink-0">
                {isFinished && Number(awayScore) > Number(homeScore) && (
                  <div className="w-0 h-0 border-t-[3.5px] border-t-transparent border-b-[3.5px] border-b-transparent border-l-[5px] border-l-app-text" />
                )}
                <span className="text-[13px] font-bold text-app-text w-5 text-right">{awayScore}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Area */}
        <MatchStatusArea match={match} />
      </div>
      <MatchFooter match={match} />
    </div>
  );
};

const TennisMatchCard = ({ match, isActive, onSelect }: { match: Match; isActive: boolean; onSelect: () => void }) => {
  const isFinished = match.status === 'FT' || match.status === 'FINISHED' || match.status === 'Finished' || match.status === 'Chung cuộc';
  const scoreParts = typeof match.score === 'string' ? match.score.split('-') : null;
  const p1Score = scoreParts?.[0]?.trim();
  const p2Score = scoreParts?.[1]?.trim();

  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex flex-col bg-app-card rounded-xl border overflow-hidden transition-all cursor-pointer shadow-sm hover:shadow-md min-h-24 shrink-0",
        isActive ? "border-app-accent ring-1 ring-app-accent/20" : "border-app-border"
      )}
    >
      <div className="flex flex-row h-full min-h-[90px]">
        <div className="flex-1 flex flex-col justify-center pl-3.5 pr-2 gap-2.5 border-r border-app-border/40 py-2">
          {/* Player 1 */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                {(match.player1?.assets?.cutout || match.player1?.assets?.flag || match.player1?.flag) && (
                  <img 
                    src={resolveAssetPath(match.player1?.assets?.cutout || match.player1?.assets?.flag || match.player1?.flag || "", { packId: "", templateId: "" })} 
                    className={cn(
                      "w-full h-full object-contain",
                      match.player1?.assets?.cutout && "object-top scale-125"
                    )} 
                    alt="" 
                  />
                )}
              </div>
              <span className="text-[12px] font-bold text-app-text truncate tracking-tight">
                {formatPlayerName(match.player1?.name) || match.player1?.id}
              </span>
            </div>
            {(match.status !== 'NS' && match.score) && (
              <div className="flex items-center gap-1.5 shrink-0">
                {isFinished && Number(p1Score) > Number(p2Score) && (
                  <div className="w-0 h-0 border-t-[3.5px] border-t-transparent border-b-[3.5px] border-b-transparent border-l-[5px] border-l-app-text" />
                )}
                <span className="text-[13px] font-bold text-app-text w-5 text-right">{p1Score}</span>
              </div>
            )}
          </div>

          {/* Player 2 */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                {(match.player2?.assets?.cutout || match.player2?.assets?.flag || match.player2?.flag) && (
                  <img 
                    src={resolveAssetPath(match.player2?.assets?.cutout || match.player2?.assets?.flag || match.player2?.flag || "", { packId: "", templateId: "" })} 
                    className={cn(
                      "w-full h-full object-contain",
                      match.player2?.assets?.cutout && "object-top scale-125"
                    )} 
                    alt="" 
                  />
                )}
              </div>
              <span className="text-[12px] font-bold text-app-text truncate tracking-tight">
                {formatPlayerName(match.player2?.name) || match.player2?.id}
              </span>
            </div>
            {(match.status !== 'NS' && match.score) && (
              <div className="flex items-center gap-1.5 shrink-0">
                {isFinished && Number(p2Score) > Number(p1Score) && (
                  <div className="w-0 h-0 border-t-[3.5px] border-t-transparent border-b-[3.5px] border-b-transparent border-l-[5px] border-l-app-text" />
                )}
                <span className="text-[13px] font-bold text-app-text w-5 text-right">{p2Score}</span>
              </div>
            )}
          </div>
        </div>
        <MatchStatusArea match={match} />
      </div>
      <MatchFooter match={match} />
    </div>
  );
};

const MatchStatusArea = ({ match }: { match: Match }) => {
  const isFinished = match.status === 'FT' || match.status === 'FINISHED' || match.status === 'Finished' || match.status === 'Chung cuộc';
  
  return (
    <div className="w-[5.5rem] shrink-0 flex flex-col items-center justify-center text-center p-2">
      <span className="text-[9px] text-app-muted font-bold mb-1 uppercase tracking-wider">
        {new Date(match.date).toLocaleDateString('en-US', { weekday: 'short' })}, {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </span>
      {!isFinished && (
        <span className={cn(
          "text-[12px] font-bold text-app-text",
          (match.status === 'LIVE' || match.isLive) && "text-red-500"
        )}>
          {getMatchStatusDisplay(match)}
        </span>
      )}
      {isFinished && (
        <span className="text-[10px] font-bold text-app-muted/60 mt-1 uppercase tracking-widest leading-none">FT</span>
      )}
    </div>
  );
};

const MatchFooter = ({ match }: { match: Match }) => (
  <div className="bg-black/[0.03] dark:bg-white/[0.03] border-t border-app-border/40 px-2.5 py-1.5 flex items-center justify-between text-[9px] text-app-muted/80">
    <span className="font-medium truncate mr-2">{match.round}</span>
    <span className="font-normal truncate text-right">{match.venue}</span>
  </div>
);

export const MatchCard = ({ match, activeTemplate, activeMatch, setEditorMatch }: MatchCardProps) => {
  const onSelect = () => {
    if (activeTemplate) {
      setEditorMatch(match);
    }
  };

  const isActive = activeMatch?.id === match.id;

  if (match.sport === 'tennis') {
    return <TennisMatchCard match={match} isActive={isActive} onSelect={onSelect} />;
  }

  // Use Soccer/Football layout by default for other sports
  return <SoccerMatchCard match={match} isActive={isActive} onSelect={onSelect} />;
};
