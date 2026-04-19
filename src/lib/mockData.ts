import { Match, Template } from "./types";

export const MOCK_MATCHES: Match[] = [
  {
    id: "m_fb_1",
    sport: "football",
    league: "Premier League",
    date: "2026-04-25T15:00:00Z",
    venue: "Old Trafford",
    liveBadge: true,
    score: "",
    homeTeam: {
      id: "t_mu",
      name: "Manchester United",
      shortName: "MUN",
      logo: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
      color: "#DA291C"
    },
    awayTeam: {
      id: "t_mc",
      name: "Manchester City",
      shortName: "MCI",
      logo: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
      color: "#6CABDD"
    }
  },
  {
    id: "m_fb_2",
    sport: "football",
    league: "Champions League",
    date: "2026-05-10T19:45:00Z",
    venue: "Santiago Bernabéu",
    liveBadge: false,
    score: "1 - 1",
    homeTeam: {
      id: "t_rma",
      name: "Real Madrid",
      shortName: "RMA",
      logo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
      color: "#FFFFFF"
    },
    awayTeam: {
      id: "t_bay",
      name: "Bayern Munich",
      shortName: "BAY",
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
      color: "#DC052D"
    }
  },
  {
    id: "m_te_1",
    sport: "tennis",
    league: "Wimbledon",
    date: "2026-07-12T14:00:00Z",
    venue: "Centre Court",
    liveBadge: true,
    player1: {
      id: "p_nd",
      name: "N. Djokovic",
      flag: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Flag_of_Serbia.svg"
    },
    player2: {
      id: "p_ca",
      name: "C. Alcaraz",
      flag: "https://upload.wikimedia.org/wikipedia/commons/8/89/Bandera_de_Espa%C3%B1a.svg"
    }
  }
];

export const MOCK_TEMPLATES: Template[] = [
  {
    id: "tpl_fb_16x9_1",
    name: "Classic Matchday TV",
    sport: "football",
    ratio: "16:9",
    thumbnail: "https://images.unsplash.com/photo-1518605368461-1ee123cb1171?auto=format&fit=crop&q=80&w=400&h=225",
    width: 1920,
    height: 1080,
    layers: [
      {
        id: "l_bg",
        name: "Background Group",
        visible: true,
        expanded: true,
        elements: [
          {
            id: "bg_1",
            type: "BackgroundImage",
            name: "Stadium Background",
            src: "https://images.unsplash.com/photo-1518605368461-1ee123cb1171?auto=format&fit=crop&q=80&w=1920&h=1080",
            visible: true, x: 0, y: 0, width: 1920, height: 1080, rotation: 0, opacity: 1
          },
          {
            id: "overlay_1",
            type: "Shape",
            name: "Dark Gradient",
            visible: true, x: 0, y: 0, width: 1920, height: 1080, rotation: 0, opacity: 0.7, fill: "#000000"
          }
        ]
      },
      {
        id: "l_teams",
        name: "Teams & Matchup",
        visible: true,
        expanded: true,
        elements: [
          {
            id: "home_logo",
            type: "Image",
            name: "Home Team Logo",
            dataKey: "homeTeam.logo",
            visible: true, x: 400, y: 340, width: 400, height: 400, rotation: 0, opacity: 1,
            draggable: true, editableProperties: ["x", "y", "width", "height", "opacity"]
          },
          {
            id: "home_name",
            type: "Text",
            name: "Home Team Name",
            dataKey: "homeTeam.name",
            text: "HOME TEAM",
            visible: true, x: 200, y: 760, width: 800, height: 60, rotation: 0, opacity: 1,
            fill: "#FFFFFF", fontFamily: "Inter", fontSize: 48, fontWeight: "bold", align: "center", textTransform: "uppercase",
            draggable: true, editableProperties: ["x", "y", "fontSize", "fill", "fontFamily", "opacity"]
          },
          {
            id: "away_logo",
            type: "Image",
            name: "Away Team Logo",
            dataKey: "awayTeam.logo",
            visible: true, x: 1120, y: 340, width: 400, height: 400, rotation: 0, opacity: 1,
            draggable: true, editableProperties: ["x", "y", "width", "height", "opacity"]
          },
          {
            id: "away_name",
            type: "Text",
            name: "Away Team Name",
            dataKey: "awayTeam.name",
            text: "AWAY TEAM",
            visible: true, x: 920, y: 760, width: 800, height: 60, rotation: 0, opacity: 1,
            fill: "#FFFFFF", fontFamily: "Inter", fontSize: 48, fontWeight: "bold", align: "center", textTransform: "uppercase",
            draggable: true, editableProperties: ["x", "y", "fontSize", "fill", "fontFamily", "opacity"]
          },
          {
            id: "vs_text",
            type: "Text",
            name: "VS Separator",
            text: "VS",
            fill: "#FFFFFF", fontFamily: "Inter", fontSize: 120, fontWeight: "bold", align: "center",
            visible: true, x: 860, y: 480, width: 200, height: 150, rotation: 0, opacity: 1,
            draggable: true, editableProperties: ["x", "y", "fontSize", "fill", "fontFamily", "opacity"]
          }
        ]
      },
      {
        id: "l_info",
        name: "Match Info",
        visible: true,
        expanded: true,
        elements: [
          {
            id: "comp_name",
            type: "Text",
            name: "Competition",
            dataKey: "match.league",
            text: "PREMIER LEAGUE",
            fill: "#FACC15", fontFamily: "Inter", fontSize: 64, fontWeight: "bold", align: "center", textTransform: "uppercase",
            visible: true, x: 0, y: 100, width: 1920, height: 80, rotation: 0, opacity: 1
          },
          {
            id: "venue_date",
            type: "Text",
            name: "Date & Time",
            dataKey: "match.date",
            text: "25 APRIL 2026",
            fill: "#FFFFFF", fontFamily: "Inter", fontSize: 48, fontWeight: "normal", align: "center", textTransform: "uppercase",
            visible: true, x: 0, y: 850, width: 1920, height: 60, rotation: 0, opacity: 0.8
          },
          {
            id: "commentator",
            type: "Text",
            name: "Commentator Info",
            dataKey: "commentator",
            text: "PETER DRURY",
            fill: "#FFFFFF", fontFamily: "Inter", fontSize: 32, fontWeight: "normal", align: "center",
            visible: true, x: 0, y: 920, width: 1920, height: 60, rotation: 0, opacity: 0.6
          },
          {
            id: "broadcast_time",
            type: "Text",
            name: "Broadcast Time",
            dataKey: "broadcast_time",
            text: "20:00 GMT",
            fill: "#FFFFFF", fontFamily: "Inter", fontSize: 32, fontWeight: "bold", align: "center",
            visible: true, x: 0, y: 970, width: 1920, height: 60, rotation: 0, opacity: 0.8
          }
        ]
      }
    ]
  },
  {
    id: "tpl_te_9x16_1",
    name: "Tennis Duel Story",
    sport: "tennis",
    ratio: "9:16",
    thumbnail: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=225&h=400",
    width: 1080,
    height: 1920,
    layers: [
       {
        id: "bg_1",
        type: "BackgroundImage",
        name: "Court Background",
        src: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=1080&h=1920",
        zIndex: 0, visible: true, x: 0, y: 0, width: 1080, height: 1920, rotation: 0, opacity: 1
      },
      {
        id: "overlay_1",
        type: "Shape",
        name: "Bottom Gradient",
        zIndex: 1, visible: true, x: 0, y: 960, width: 1080, height: 960, rotation: 0, opacity: 0.9, fill: "#000000"
      },
      {
        id: "p1_name",
        type: "Text",
        name: "Player 1 Name",
        dataKey: "player1.name",
        text: "N. DJOKOVIC",
        fill: "#FFFFFF", fontFamily: "Inter", fontSize: 72, fontWeight: "bold", align: "center",
        zIndex: 3, visible: true, x: 0, y: 1300, width: 1080, height: 100, rotation: 0, opacity: 1
      },
      {
        id: "vs_text",
        type: "Text",
        name: "VS",
        text: "VS",
        fill: "#EAB308", fontFamily: "Inter", fontSize: 60, fontWeight: "normal", align: "center",
        zIndex: 3, visible: true, x: 0, y: 1420, width: 1080, height: 80, rotation: 0, opacity: 1
      },
      {
        id: "p2_name",
        type: "Text",
        name: "Player 2 Name",
        dataKey: "player2.name",
        text: "C. ALCARAZ",
        fill: "#FFFFFF", fontFamily: "Inter", fontSize: 72, fontWeight: "bold", align: "center",
        zIndex: 3, visible: true, x: 0, y: 1540, width: 1080, height: 100, rotation: 0, opacity: 1
      }
    ]
  }
];
