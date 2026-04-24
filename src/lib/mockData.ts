import { Match, Template } from "../types/template";
// Pre-defined mock data to avoid complex relative public imports which can fail in some dev environments
const mciData = {
  "id": "manchester-city",
  "name": "Manchester City",
  "shortName": "MCI",
  "colors": {
    "primary": "#6CABDD",
    "secondary": "#FFFFFF",
    "accent": "#FFC20E"
  },
  "assets": {
    "logo": "@global/soccer/teams/manchester-city/logo.svg"
  }
};

const munData = {
  "id": "manchester-united",
  "name": "Manchester United",
  "shortName": "MUN",
  "colors": {
    "primary": "#DA291C",
    "secondary": "#FFFFFF",
    "accent": "#FBE122"
  },
  "assets": {
    "logo": "@global/soccer/teams/manchester-united/logo.svg"
  }
};

const rmaData = {
  "id": "real-madrid",
  "name": "Real Madrid",
  "shortName": "RMA",
  "colors": {
    "primary": "#FFFFFF",
    "secondary": "#FEBE10",
    "accent": "#00529F"
  },
  "assets": {
    "logo": "@global/soccer/teams/real-madrid/logo.svg"
  }
};

const bayData = {
  "id": "bayern-munich",
  "name": "Bayern Munich",
  "shortName": "FCB",
  "colors": {
    "primary": "#DC052D",
    "secondary": "#FFFFFF",
    "accent": "#0066B2"
  },
  "assets": {
    "logo": "@global/soccer/teams/bayern-munich/logo.svg"
  }
};

const lfcData = {
  "id": "liverpool",
  "name": "Liverpool",
  "shortName": "LIV",
  "colors": {
    "primary": "#C8102E",
    "secondary": "#FFFFFF",
    "accent": "#00B2A9"
  },
  "assets": {
    "logo": "@global/soccer/teams/liverpool/logo.svg"
  }
};

const arsData = {
  "id": "arsenal",
  "name": "Arsenal",
  "shortName": "ARS",
  "colors": {
    "primary": "#EF0107",
    "secondary": "#FFFFFF",
    "accent": "#063672"
  },
  "assets": {
    "logo": "@global/soccer/teams/arsenal/logo.svg"
  }
};

const cheData = {
  "id": "chelsea",
  "name": "Chelsea",
  "shortName": "CHE",
  "colors": {
    "primary": "#034694",
    "secondary": "#FFFFFF",
    "accent": "#DBA111"
  },
  "assets": {
    "logo": "@global/soccer/teams/chelsea/logo.svg"
  }
};

const bhaData = {
  "id": "brighton",
  "name": "Brighton & Hove Albion",
  "shortName": "BHA",
  "colors": {
    "primary": "#0057B8",
    "secondary": "#FFFFFF",
    "accent": "#FFCD00"
  },
  "assets": {
    "logo": "@global/soccer/teams/brighton/logo.svg"
  }
};

const ndData = {
  "id": "novak-djokovic",
  "name": "Novak Djokovic",
  "shortName": "N. Djokovic",
  "atpRanking": "1",
  "colors": {
    "primary": "#FFFFFF",
    "secondary": "#000000"
  },
  "assets": {
    "flag": "https://flagcdn.com/w80/rs.png",
    "cutout": "https://www.atptour.com/-/media/alias/player-headshot/d643"
  }
};

const caData = {
  "id": "carlos-alcaraz",
  "name": "Carlos Alcaraz",
  "shortName": "C. Alcaraz",
  "atpRanking": "3",
  "colors": {
    "primary": "#FFFFFF",
    "secondary": "#000000"
  },
  "assets": {
    "flag": "https://flagcdn.com/w80/es.png",
    "cutout": "https://www.atptour.com/-/media/alias/player-headshot/a0e2"
  }
};

const ovData = {
  "id": "otto-virtanen",
  "name": "Otto Virtanen",
  "shortName": "O. Virtanen",
  "atpRanking": "125",
  "colors": {
    "primary": "#FFFFFF",
    "secondary": "#000000"
  },
  "assets": {
    "flag": "https://flagcdn.com/w80/fi.png",
    "cutout": ""
  }
};

const LOCAL_DB: Record<string, any> = {
  "manchester-city": mciData,
  "manchester-united": munData,
  "real-madrid": rmaData,
  "bayern-munich": bayData,
  "liverpool": lfcData,
  "arsenal": arsData,
  "chelsea": cheData,
  "brighton": bhaData,
  "novak-djokovic": ndData,
  "carlos-alcaraz": caData,
  "otto-virtanen": ovData
};

const hydrateTeam = (teamId: string) => {
  return LOCAL_DB[teamId] || { id: teamId };
};

const RAW_MOCK_MATCHES: Match[] = [
  {
    id: "m_fb_1",
    sport: "soccer",
    league: "Premier League",
    competition: {
      id: "premier-league",
      type: "league",
      name: "Premier League",
      code: "EPL",
      countryCode: "GB-ENG",
      logo: "@global/soccer/competitions/premier-league/logo.svg",
      flag: "@global/common/countries/gb-eng.svg"
    },
    round: "Matchday 32",
    date: "2026-04-25T15:00:00Z",
    time: "15:00",
    venue: "Old Trafford",
    liveBadge: false,
    status: "NS", // Not Started
    score: "",
    homeTeam: { id: "manchester-united" },
    awayTeam: { id: "manchester-city" },
    awayTeamOverrides: {
      kit: {
        type: "away",
        primary: "#000000"
      }
    }
  },
  {
    id: "m_fb_2",
    sport: "soccer",
    league: "Champions League",
    competition: {
      id: "champions-league",
      type: "cup",
      name: "Champions League",
      code: "UCL",
      logo: "@global/soccer/competitions/champions-league/logo.svg"
    },
    round: "Semi-Final 1st Leg",
    date: "2026-05-10T19:45:00Z",
    time: "19:45",
    venue: "Santiago Bernabéu",
    liveBadge: false,
    status: "FT", // Full Time
    score: {
      ht: [0, 1],
      ft: [1, 1]
    },
    homeTeam: { id: "real-madrid" },
    awayTeam: { id: "bayern-munich" }
  },
  {
    id: "m_te_1",
    sport: "tennis",
    league: "ATP Tour - Wimbledon",
    tournament: "Wimbledon 2024",
    competition: {
      id: "wimbledon",
      type: "cup",
      name: "Wimbledon",
      countryCode: "GB-ENG",
      logo: "@global/tennis/competitions/wimbledon/logo.svg"
    },
    round: "Finals",
    date: "2026-07-12T14:00:00Z",
    time: "14:00",
    venue: "Centre Court",
    liveBadge: true,
    status: "LIVE",
    score: "2 - 1",
    player1: { id: "novak-djokovic", name: "Novak Djokovic" },
    player2: { id: "carlos-alcaraz", name: "Carlos Alcaraz" }
  },
  {
    id: "m_te_2",
    sport: "tennis",
    league: "ATP Barcelona",
    tournament: "Barcelona Open Banc Sabadell",
    competition: {
      id: "barcelona-open",
      type: "cup",
      name: "Barcelona Open",
      countryCode: "ES",
      logo: "@shared/logos/barcelona-open.png"
    },
    round: "Round  1/16",
    date: "2026-04-23T15:00:00Z",
    time: "15:00",
    venue: "Real Club de Tennis Barcelona",
    liveBadge: false,
    status: "FT",
    score: "2 - 0",
    sets: ["6 - 4", "6 - 2"],
    player1: { id: "carlos-alcaraz", name: "C. Alcaraz" },
    player2: { id: "otto-virtanen", name: "O. Virtanen" }
  },
  {
    id: "m_fb_3",
    sport: "soccer",
    league: "Premier League",
    competition: {
      id: "premier-league",
      type: "league",
      name: "Premier League",
      code: "EPL",
      countryCode: "GB-ENG",
      logo: "@global/soccer/competitions/premier-league/logo.svg",
      flag: "@global/common/countries/gb-eng.svg"
    },
    round: "Matchday 5",
    date: "2026-04-22T17:30:00Z",
    time: "",
    venue: "Amex Stadium",
    liveBadge: false,
    status: "FT",
    score: "3 - 0",
    homeTeam: { id: "brighton" },
    awayTeam: { id: "chelsea" }
  },
  {
    id: "m_fb_4",
    sport: "soccer",
    league: "Premier League",
    competition: {
      id: "premier-league",
      type: "league",
      name: "Premier League",
      code: "EPL",
      countryCode: "GB-ENG",
      logo: "@global/soccer/competitions/premier-league/logo.svg",
      flag: "@global/common/countries/gb-eng.svg"
    },
    round: "Matchday 8",
    date: "2026-04-19T15:00:00Z",
    time: "",
    venue: "Stamford Bridge",
    liveBadge: true,
    status: "FT",
    score: "0 - 1",
    homeTeam: { id: "chelsea" },
    awayTeam: { id: "manchester-united" }
  },
  {
    id: "m_fb_5",
    sport: "soccer",
    league: "Premier League",
    competition: {
      id: "premier-league",
      type: "league",
      name: "Premier League",
      code: "EPL",
      countryCode: "GB-ENG",
      logo: "@global/soccer/competitions/premier-league/logo.svg",
      flag: "@global/common/countries/gb-eng.svg"
    },
    round: "Matchday 12",
    date: "2026-04-12T20:00:00Z",
    time: "",
    venue: "Stamford Bridge",
    liveBadge: false,
    status: "FT",
    score: "0 - 3",
    homeTeam: { id: "chelsea" },
    awayTeam: { id: "manchester-city" }
  },
  {
    id: "m_fb_6",
    sport: "soccer",
    league: "Champions League",
    competition: {
      id: "champions-league",
      type: "cup",
      name: "Champions League",
      code: "UCL",
      logo: "@global/soccer/competitions/champions-league/logo.svg"
    },
    round: "Semi-Final 2nd Leg",
    date: "2026-05-18T19:45:00Z",
    time: "19:45",
    venue: "Allianz Arena",
    liveBadge: false,
    status: "NS",
    score: "",
    homeTeam: { id: "bayern-munich" },
    awayTeam: { id: "real-madrid" }
  }
];

export const MOCK_MATCHES: Match[] = RAW_MOCK_MATCHES.map((m: any) => {
  const overrides: any = {};
  if (m.homeTeam && m.homeTeam.id) overrides.homeTeam = hydrateTeam(m.homeTeam.id);
  if (m.awayTeam && m.awayTeam.id) overrides.awayTeam = hydrateTeam(m.awayTeam.id);
  
  if (m.player1 && m.player1.id) overrides.player1 = hydrateTeam(m.player1.id);
  if (m.player2 && m.player2.id) overrides.player2 = hydrateTeam(m.player2.id);
  
  return {
    ...m,
    ...overrides
  };
}) as Match[];
