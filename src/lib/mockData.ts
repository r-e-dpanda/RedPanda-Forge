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

const ndData = {
  "id": "novak-djokovic",
  "name": "Novak Djokovic",
  "shortName": "N. Djokovic",
  "flag": "rs",
  "colors": {
    "primary": "#FFFFFF",
    "secondary": "#000000"
  }
};

const caData = {
  "id": "carlos-alcaraz",
  "name": "Carlos Alcaraz",
  "shortName": "C. Alcaraz",
  "flag": "es",
  "colors": {
    "primary": "#FFFFFF",
    "secondary": "#000000"
  }
};

const LOCAL_DB: Record<string, any> = {
  "manchester-city": mciData,
  "manchester-united": munData,
  "real-madrid": rmaData,
  "bayern-munich": bayData,
  "novak-djokovic": ndData,
  "carlos-alcaraz": caData
};

const hydrateTeam = (teamId: string) => {
  return LOCAL_DB[teamId] || { id: teamId };
};

const RAW_MOCK_MATCHES: Match[] = [
  {
    id: "m_fb_1",
    sport: "football",
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
    sport: "football",
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
    competition: {
      id: "wimbledon",
      type: "cup",
      name: "Wimbledon",
      countryCode: "GB-ENG",
      logo: "@global/tennis/competitions/wimbledon/logo.svg"
    },
    round: "Final",
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
    id: "m_fb_3",
    sport: "football",
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
    score: "3-0",
    homeTeam: { 
      id: "brighton",
      name: "Brighton",
      shortName: "BHA",
      logo: "@global/soccer/teams/brighton/logo.svg"
    },
    awayTeam: { 
      id: "chelsea",
      name: "Chelsea",
      shortName: "CHE",
      logo: "@global/soccer/teams/chelsea/logo.svg"
    }
  },
  {
    id: "m_fb_4",
    sport: "football",
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
    score: "0-1",
    homeTeam: { 
      id: "chelsea",
      name: "Chelsea",
      shortName: "CHE",
      logo: "@global/soccer/teams/chelsea/logo.svg"
    },
    awayTeam: { 
      id: "manchester-united"
    }
  },
  {
    id: "m_fb_5",
    sport: "football",
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
    score: "0-3",
    homeTeam: { 
      id: "chelsea",
      name: "Chelsea",
      shortName: "CHE",
      logo: "@global/soccer/teams/chelsea/logo.svg"
    },
    awayTeam: { 
      id: "manchester-city"
    }
  },
  {
    id: "m_fb_6",
    sport: "football",
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
    homeTeam: { 
      id: "bayern-munich",
      name: "Bayern Munich",
      shortName: "FCB",
      logo: "@global/soccer/teams/bayern-munich/logo.svg"
    },
    awayTeam: { 
      id: "real-madrid",
      name: "Real Madrid",
      shortName: "RMA",
      logo: "@global/soccer/teams/real-madrid/logo.svg"
    }
  }
];

export const MOCK_TEMPLATES: Template[] = [
  {
    id: "tpl_fb_16x9_1",
    name: "Classic Matchday TV",
    version: "1.0",
    sport: "football",
    ratio: "16:9",
    thumbnail: "https://picsum.photos/seed/fb_tpl1/400/225",
    canvas: {
      width: 1920,
      height: 1080,
      backgroundColor: "#000000"
    },
    layers: [
      {
        id: "l_bg",
        type: "Group",
        name: "Background Group",
        visible: true,
        zIndex: 0,
        position: { x: 0, y: 0 },
        children: [
          {
            id: "bg_1",
            type: "Image",
            name: "Stadium Background",
            src: "https://images.unsplash.com/photo-1623607915241-a3151d59a9c8?q=80&w=1080&auto=format&fit=crop",
            visible: true, zIndex: 0, position: {x: 0, y: 0}, size: {width: 1920, height: 1080}, rotation: 0, opacity: 1, objectFit: "cover"
          },
          {
            id: "overlay_1",
            type: "Shape",
            name: "Dark Gradient",
            shapeType: "quad",
            style: { fill: "#000000" },
            visible: true, zIndex: 1, position: {x: 0, y: 0}, size: {width: 1920, height: 1080}, rotation: 0, opacity: 0.7
          }
        ]
      },
      {
        id: "l_teams",
        type: "Group",
        name: "Teams & Matchup",
        visible: true,
        zIndex: 1,
        position: { x: 0, y: 0 },
        children: [
          {
            id: "home_logo",
            type: "Image",
            name: "Home Team Logo",
            visible: true, zIndex: 1, position: {x: 400, y: 340}, size: {width: 400, height: 400}, rotation: 0, opacity: 1, objectFit: "contain",
            src: "@global/soccer/teams/{{match.homeTeam.id}}/logo.svg"
          },
          {
            id: "home_name",
            type: "Text",
            dataType: "string",
            name: "Home Team Name",
            dataKey: "homeTeam.name",
            text: "HOME TEAM",
            visible: true, zIndex: 2, position: {x: 200, y: 760}, size: {width: 800, height: 60}, rotation: 0, opacity: 1,
            style: { fill: "{{homeTeam.colors.primary}}", fontFamily: "Inter", fontSize: 48, fontWeight: "bold", align: "center" },
            formatters: ["uppercase"]
          },
          {
            id: "away_logo",
            type: "Image",
            name: "Away Team Logo",
            visible: true, zIndex: 3, position: {x: 1120, y: 340}, size: {width: 400, height: 400}, rotation: 0, opacity: 1, objectFit: "contain",
            src: "@global/soccer/teams/{{match.awayTeam.id}}/logo.svg"
          },
          {
            id: "away_name",
            type: "Text",
            dataType: "string",
            name: "Away Team Name",
            dataKey: "awayTeam.name",
            text: "AWAY TEAM",
            visible: true, zIndex: 4, position: {x: 920, y: 760}, size: {width: 800, height: 60}, rotation: 0, opacity: 1,
            style: { fill: "{{awayTeam.colors.primary}}", fontFamily: "Inter", fontSize: 48, fontWeight: "bold", align: "center" },
            formatters: ["uppercase"]
          },
          {
            id: "vs_text",
            type: "Text",
            name: "VS Separator",
            text: "VS",
            style: { fill: "#FFFFFF", fontFamily: "Inter", fontSize: 120, fontWeight: "bold", align: "center" },
            visible: true, zIndex: 5, position: {x: 860, y: 480}, size: {width: 200, height: 150}, rotation: 0, opacity: 1
          }
        ]
      },
      {
        id: "l_info",
        type: "Group",
        name: "Match Info",
        visible: true,
        zIndex: 2,
        position: { x: 0, y: 0 },
        children: [
          {
            id: "comp_name",
            type: "Text",
            name: "Competition",
            dataKey: "match.league",
            text: "PREMIER LEAGUE",
            style: { fill: "#FACC15", fontFamily: "Inter", fontSize: 64, fontWeight: "bold", align: "center" },
            visible: true, zIndex: 1, position: {x: 0, y: 100}, size: {width: 1920, height: 80}, rotation: 0, opacity: 1
          },
          {
            id: "venue_date",
            type: "Text",
            dataType: "date",
            name: "Date & Time",
            dataKey: "match.date",
            text: "25 APRIL 2026",
            formatters: ["date:dd MMM yyyy", "uppercase"],
            style: { fill: "#FFFFFF", fontFamily: "Inter", fontSize: 48, fontWeight: "normal", align: "center" },
            visible: true, zIndex: 2, position: {x: 0, y: 850}, size: {width: 1920, height: 60}, rotation: 0, opacity: 0.8
          },
          {
            id: "stadium_name",
            type: "Text",
            name: "Stadium Name",
            dataKey: "match.venue",
            text: "STADIUM NAME",
            formatters: ["uppercase"],
            style: { fill: "#FFFFFF", fontFamily: "Inter", fontSize: 32, fontWeight: "bold", align: "center" },
            visible: true, zIndex: 3, position: {x: 0, y: 920}, size: {width: 1920, height: 40}, rotation: 0, opacity: 0.6
          },
          {
            id: "commentator_name",
            type: "Text",
            name: "Commentator",
            text: "COMMENTARY: PETER DRURY",
            style: { fill: "#FACC15", fontFamily: "Inter", fontSize: 24, fontWeight: "normal", align: "right" },
            visible: false, zIndex: 4, position: {x: 1400, y: 1000}, size: {width: 480, height: 40}, rotation: 0, opacity: 0.9
          }
        ]
      }
    ]
  },
  {
    id: "tpl_fb_9x16_2",
    name: "Diagonal Matchday Story",
    version: "1.0",
    sport: "football",
    ratio: "9:16",
    thumbnail: "https://picsum.photos/seed/fb_story/225/400",
    canvas: {
      width: 1080,
      height: 1920,
      backgroundColor: "#111111"
    },
    layers: [
      {
        id: "l_bg",
        type: "Group",
        name: "Background",
        visible: true,
        zIndex: 0,
        position: { x: 0, y: 0 },
        children: [
          {
            id: "stadium_bg",
            type: "Image",
            name: "Stadium Image",
            src: "https://images.unsplash.com/photo-1556816214-6d16c62fbbf6?q=80&w=1080&auto=format&fit=crop",
            visible: true, zIndex: 0, position: {x: 0, y: 0}, size: {width: 1080, height: 1920}, rotation: 0, opacity: 0.8, objectFit: "cover"
          },
          {
            id: "away_tint",
            type: "Shape",
            name: "Away Team Overlay",
            shapeType: "quad",
            style: { fill: "#0A1B3B" }, // Man City dark blue vibe fallback
            visible: true, zIndex: 1, position: {x: 0, y: 0}, size: {width: 1080, height: 1920}, rotation: 0, opacity: 0.6
          },
          {
            id: "home_poly",
            type: "Shape",
            name: "Home Quad",
            shapeType: "quad",
            dataKey: "homeTeam.colors.primary",
            style: { fill: "{{homeTeam.colors.primary}}" },
            visible: true, zIndex: 2, position: {x: 0, y: 0}, rotation: 0, opacity: 0.65,
            size: {width: 700, height: 1920},
            topWidth: 400,
            skewX: 0,
            flipY: true
          },
          {
            id: "match_day_bg",
            type: "Text",
            name: "MATCH DAY Huge Text",
            text: "MATCH DAY",
            style: { fill: "#FFFFFF", fontFamily: "Inter", fontSize: 220, fontWeight: "bold", align: "center" },
            visible: true, zIndex: 3, position: {x: 0, y: 150}, size: {width: 1080, height: 250}, rotation: 0, opacity: 0.4
          }
        ]
      },
      {
        id: "l_players",
        type: "Group",
        name: "Subject layer",
        visible: true,
        zIndex: 1,
        position: { x: 0, y: 0 },
        children: [
          {
            id: "home_big_logo",
            type: "Image",
            name: "Home Team Visual",
            visible: true, zIndex: 1, position: {x: 50, y: 400}, size: {width: 500, height: 500}, rotation: 0, opacity: 0.95, objectFit: "contain",
            src: "@global/soccer/teams/{{match.homeTeam.id}}/logo.svg"
          },
          {
            id: "away_big_logo",
            type: "Image",
            name: "Away Team Visual",
            visible: true, zIndex: 2, position: {x: 600, y: 650}, size: {width: 450, height: 450}, rotation: 0, opacity: 0.95, objectFit: "contain",
            src: "@global/soccer/teams/{{match.awayTeam.id}}/logo.svg"
          }
        ]
      },
      {
        id: "l_foreground",
        type: "Group",
        name: "Typography & Information",
        visible: true,
        zIndex: 2,
        position: { x: 0, y: 0 },
        children: [
          {
            id: "league_text",
            type: "Text",
            name: "League Name",
            dataKey: "match.league",
            text: "PREMIER LEAGUE",
            formatters: ["uppercase"],
            style: { fill: "#FFFFFF", fontFamily: "Inter", fontSize: 40, fontWeight: "bold", align: "center", shadowColor: "#000", shadowBlur: 10 },
            visible: true, zIndex: 1, position: {x: 0, y: 50}, size: {width: 1080, height: 60}, rotation: 0, opacity: 1
          },
          {
            id: "venue_text",
            type: "Text",
            name: "Stadium Name Rotate",
            dataKey: "match.venue",
            text: "ANFIELD STADIUM",
            formatters: ["uppercase"],
            style: { fill: "#FFFFFF", fontFamily: "Inter", fontSize: 50, fontWeight: "bold", align: "left" },
            visible: true, zIndex: 2, position: {x: -450, y: 700}, size: {width: 1000, height: 80}, rotation: -90, opacity: 0.7
          },
          {
            id: "home_name_box",
            type: "Shape",
            name: "Home Name Box",
            shapeType: "quad",
            style: { fill: "#7F0000" }, // Dark red fallback
            visible: true, zIndex: 3, position: {x: 60, y: 1350}, size: {width: 420, height: 80}, rotation: 0, opacity: 0.9
          },
          {
            id: "home_name_txt",
            type: "Text",
            name: "Home Team Name",
            dataKey: "homeTeam.name",
            text: "LIVERPOOL",
            formatters: ["uppercase"],
            style: { fill: "#FFFFFF", fontFamily: "Inter", fontSize: 36, fontWeight: "bold", align: "center" },
            visible: true, zIndex: 4, position: {x: 60, y: 1370}, size: {width: 420, height: 60}, rotation: 0, opacity: 1
          },
          {
            id: "away_name_box",
            type: "Shape",
            name: "Away Name Box",
            shapeType: "quad",
            style: { fill: "#0B1D42" }, // Dark blue fallback
            visible: true, zIndex: 5, position: {x: 600, y: 1350}, size: {width: 440, height: 80}, rotation: 0, opacity: 0.9
          },
          {
            id: "away_name_txt",
            type: "Text",
            name: "Away Team Name",
            dataKey: "awayTeam.name",
            text: "MANCHESTER CITY",
            formatters: ["uppercase"],
            style: { fill: "#FFFFFF", fontFamily: "Inter", fontSize: 36, fontWeight: "bold", align: "center" },
            visible: true, zIndex: 6, position: {x: 600, y: 1370}, size: {width: 440, height: 60}, rotation: 0, opacity: 1
          },
          {
            id: "vs_text_center",
            type: "Text",
            name: "VS",
            text: "VS",
            style: { fill: "#FFFFFF", fontFamily: "Inter", fontSize: 100, fontWeight: "bold", align: "center", shadowColor: "#000", shadowBlur: 20 },
            visible: true, zIndex: 7, position: {x: 460, y: 1320}, size: {width: 160, height: 120}, rotation: 0, opacity: 1
          },
          {
            id: "home_logo_small",
            type: "Image",
            name: "Home Logo Small",
            src: "@global/soccer/teams/{{match.homeTeam.id}}/logo.svg",
            visible: true, zIndex: 8, position: {x: 180, y: 1470}, size: {width: 140, height: 140}, rotation: 0, opacity: 1, objectFit: "contain"
          },
          {
            id: "match_time",
            type: "Text",
            name: "Kickoff Time",
            dataKey: "match.date",
            text: "17:00",
            formatters: ["date:HH:mm"],
            style: { fill: "#FFFFFF", fontFamily: "Inter", fontSize: 110, fontWeight: "bold", align: "center" },
            visible: true, zIndex: 9, position: {x: 350, y: 1490}, size: {width: 380, height: 120}, rotation: 0, opacity: 1
          },
          {
            id: "away_logo_small",
            type: "Image",
            name: "Away Logo Small",
            src: "@global/soccer/teams/{{match.awayTeam.id}}/logo.svg",
            visible: true, zIndex: 10, position: {x: 750, y: 1470}, size: {width: 140, height: 140}, rotation: 0, opacity: 1, objectFit: "contain"
          },
          {
            id: "match_date",
            type: "Text",
            name: "Match Date",
            dataKey: "match.date",
            dataType: "date",
            text: "SUNDAY, 01 DEC 2024",
            formatters: ["date:EEEE, dd MMM yyyy", "uppercase"],
            style: { fill: "#FFFFFF", fontFamily: "Inter", fontSize: 75, fontWeight: "bold", align: "center" },
            visible: true, zIndex: 11, position: {x: 0, y: 1680}, size: {width: 1080, height: 100}, rotation: 0, opacity: 1
          }
        ]
      },
      {
        id: "l_footer",
        type: "Group",
        name: "Broadcaster Footer",
        visible: true,
        zIndex: 3,
        position: { x: 0, y: 0 },
        children: [
          {
            id: "footer_bg",
            type: "Shape",
            name: "Footer Strip",
            shapeType: "quad",
            style: { fill: "#666666" },
            topWidth: 900,
            visible: true, zIndex: 1, position: {x: 0, y: 1820}, size: {width: 1080, height: 100}, rotation: 0, opacity: 0.5
          },
          {
            id: "live_on_txt",
            type: "Text",
            name: "Live On",
            text: "LIVE ON",
            style: { fill: "#FFFFFF", fontFamily: "Inter", fontSize: 24, fontWeight: "bold", align: "left" },
            visible: true, zIndex: 2, position: {x: 100, y: 1855}, size: {width: 150, height: 40}, rotation: 0, opacity: 0.8
          },
          {
            id: "broadcaster_fake_1",
            type: "Shape",
            name: "Broadcaster Logo 1",
            shapeType: "quad",
            style: { fill: "#EAB308" },
            visible: true, zIndex: 3, position: {x: 280, y: 1845}, size: {width: 120, height: 40}, rotation: 0, opacity: 1
          },
          {
             id: "broadcaster_fake_2",
             type: "Shape",
             name: "Broadcaster Logo 2",
             shapeType: "quad",
             style: { fill: "#3B82F6" },
             visible: true, zIndex: 4, position: {x: 480, y: 1845}, size: {width: 150, height: 40}, rotation: 0, opacity: 1
          }
        ]
      }
    ]
  },
  {
    id: "tpl_te_9x16_1",
    name: "Tennis Duel Story",
    version: "1.0",
    sport: "tennis",
    ratio: "9:16",
    thumbnail: "https://picsum.photos/seed/tennis_tpl/225/400",
    canvas: {
      width: 1080,
      height: 1920,
      backgroundColor: "#000000"
    },
    layers: [
       {
        id: "bg_1",
        type: "Image",
        name: "Court Background",
        src: "https://picsum.photos/seed/tennis_court/1080/1920",
        zIndex: 0, visible: true, position: {x: 0, y: 0}, size: {width: 1080, height: 1920}, rotation: 0, opacity: 1, objectFit: "cover"
      },
      {
        id: "overlay_1",
        type: "Shape",
        name: "Bottom Gradient",
        shapeType: "quad",
        style: { fill: "#000000" },
        zIndex: 1, visible: true, position: {x: 0, y: 960}, size: {width: 1080, height: 960}, rotation: 0, opacity: 0.9
      },
      {
        id: "p1_name",
        type: "Text",
        name: "Player 1 Name",
        dataKey: "player1.name",
        text: "N. DJOKOVIC",
        style: { fill: "#FFFFFF", fontFamily: "Inter", fontSize: 72, fontWeight: "bold", align: "center" },
        zIndex: 3, visible: true, position: {x: 0, y: 1300}, size: {width: 1080, height: 100}, rotation: 0, opacity: 1
      },
      {
        id: "vs_text",
        type: "Text",
        name: "VS",
        text: "VS",
        style: { fill: "#EAB308", fontFamily: "Inter", fontSize: 60, fontWeight: "normal", align: "center" },
        zIndex: 3, visible: true, position: {x: 0, y: 1420}, size: {width: 1080, height: 80}, rotation: 0, opacity: 1
      },
      {
        id: "p2_name",
        type: "Text",
        name: "Player 2 Name",
        dataKey: "player2.name",
        text: "C. ALCARAZ",
        style: { fill: "#FFFFFF", fontFamily: "Inter", fontSize: 72, fontWeight: "bold", align: "center" },
        zIndex: 3, visible: true, position: {x: 0, y: 1540}, size: {width: 1080, height: 100}, rotation: 0, opacity: 1
      }
    ]
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
