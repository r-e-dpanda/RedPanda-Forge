import { Match, TemplateElement } from '../types/template';

export const isAutoResolved = (dataKey: string, match: Match | null) => {
  if (!match) return false;
  const autoKeys = [
    "match.league", "competition.name", "match.date", "date", 
    "time", "round", "venue.name", "homeTeam.name", "awayTeam.name", 
    "homeTeam.shortName", "awayTeam.shortName", "player1.name", 
    "player2.name", "homeTeam.logo", "awayTeam.logo", "player1.flag", "player2.flag"
  ];
  return autoKeys.includes(dataKey);
}

export const resolveBoundData = (
  element: any, 
  match: Match | null, 
  manualInputs: Record<string, string>,
  overrides: any = {}
): any => {
  let resolvedElement = { ...element };
  
  // 1. Data Binding logic
  if (element.dataKey) {
    const isAuto = isAutoResolved(element.dataKey, match);

    if (element.type === "Text" || element.type === "text") {
      if (!isAuto) {
         resolvedElement.text = manualInputs[element.dataKey] !== undefined ? manualInputs[element.dataKey] : `{{${element.dataKey}}}`;
      } else if (match) {
          if (element.dataKey === "match.league" || element.dataKey === "competition.name") resolvedElement.text = match.league;
          if (element.dataKey === "match.date" || element.dataKey === "date") resolvedElement.text = new Date(match.date).toLocaleDateString("en-GB", { day: 'numeric', month: '2-digit', year: 'numeric' });
          if (element.dataKey === "time") resolvedElement.text = "19:45"; // mock time
          if (element.dataKey === "round") resolvedElement.text = "Final"; // mock round
          if (element.dataKey === "venue.name") resolvedElement.text = match.venue || "Stadium";
          if (element.dataKey === "homeTeam.name") resolvedElement.text = match.homeTeam?.name || "";
          if (element.dataKey === "awayTeam.name") resolvedElement.text = match.awayTeam?.name || "";
          if (element.dataKey === "homeTeam.shortName") resolvedElement.text = match.homeTeam?.shortName || match.homeTeam?.name?.substring(0,3).toUpperCase() || "";
          if (element.dataKey === "awayTeam.shortName") resolvedElement.text = match.awayTeam?.shortName || match.awayTeam?.name?.substring(0,3).toUpperCase() || "";
          if (element.dataKey === "player1.name") resolvedElement.text = match.player1?.name || "";
          if (element.dataKey === "player2.name") resolvedElement.text = match.player2?.name || "";
      }
    } else if (element.type === "Image" || element.type === "image" || element.type === "BackgroundImage") {
      if (!isAuto) {
           resolvedElement.src = manualInputs[element.dataKey] !== undefined ? manualInputs[element.dataKey] : "";
      } else if (match) {
          if (element.dataKey === "homeTeam.logo") resolvedElement.src = match.homeTeam?.logo;
          if (element.dataKey === "awayTeam.logo") resolvedElement.src = match.awayTeam?.logo;
          if (element.dataKey === "player1.flag") resolvedElement.src = match.player1?.flag;
          if (element.dataKey === "player2.flag") resolvedElement.src = match.player2?.flag;
      }
    }
  }
  
  // 2. Editor Override logic (applied last)
  if (overrides) {
    // Handle nested position/size overrides if they are passed flatly
    if (overrides.x !== undefined || overrides.y !== undefined) {
      resolvedElement.position = {
        ...resolvedElement.position,
        x: overrides.x !== undefined ? overrides.x : resolvedElement.position?.x,
        y: overrides.y !== undefined ? overrides.y : resolvedElement.position?.y
      };
    }
    if (overrides.width !== undefined || overrides.height !== undefined) {
      resolvedElement.size = {
        ...resolvedElement.size,
        width: overrides.width !== undefined ? overrides.width : resolvedElement.size?.width,
        height: overrides.height !== undefined ? overrides.height : resolvedElement.size?.height
      };
    }

    resolvedElement = {
      ...resolvedElement,
      ...overrides
    };
  }

  return resolvedElement;
};
