import { Match, Template } from "../types/template";

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
      logo: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg", // Keep old field for legacy templates
      color: "#DA291C", // Keep old field
      colors: {
        primary: "#DA291C",
        secondary: "#000000",
        accent: "#FBE122"
      },
      assets: {
        logo: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
        badge: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
        kit: {
          home: { type: "home", primary: "#DA291C", image: "" }
        },
        background: "https://picsum.photos/seed/mu_stadium/2000/1200" // example stadium
      }
    },
    awayTeam: {
      id: "t_mc",
      name: "Manchester City",
      shortName: "MCI",
      logo: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
      color: "#6CABDD",
      colors: {
        primary: "#6CABDD",
        secondary: "#FFFFFF",
        accent: "#1C2C5B"
      },
      assets: {
        logo: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
        kit: {
          away: { type: "away", primary: "#000000", image: "" } // Example 24/25 away kit logic
        }
      }
    },
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
    league: "ATP Tour - Wimbledon",
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
            src: "https://picsum.photos/seed/stadium_wider/1920/1080",
            visible: true, zIndex: 0, position: {x: 0, y: 0}, size: {width: 1920, height: 1080}, rotation: 0, opacity: 1, objectFit: "cover"
          },
          {
            id: "overlay_1",
            type: "Shape",
            name: "Dark Gradient",
            shapeType: "rect",
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
            dataKey: "homeTeam.logo",
            visible: true, zIndex: 1, position: {x: 400, y: 340}, size: {width: 400, height: 400}, rotation: 0, opacity: 1, objectFit: "contain",
            src: ""
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
            dataKey: "awayTeam.logo",
            visible: true, zIndex: 3, position: {x: 1120, y: 340}, size: {width: 400, height: 400}, rotation: 0, opacity: 1, objectFit: "contain",
            src: ""
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
            src: "https://picsum.photos/seed/vertical_stadium/1080/1920",
            visible: true, zIndex: 0, position: {x: 0, y: 0}, size: {width: 1080, height: 1920}, rotation: 0, opacity: 0.8, objectFit: "cover"
          },
          {
            id: "away_tint",
            type: "Shape",
            name: "Away Team Overlay",
            shapeType: "rect",
            style: { fill: "#0A1B3B" }, // Man City dark blue vibe fallback
            visible: true, zIndex: 1, position: {x: 0, y: 0}, size: {width: 1080, height: 1920}, rotation: 0, opacity: 0.6
          },
          {
            id: "home_poly",
            type: "Shape",
            shapeType: "rect",
            name: "Home Quad",
            style: { fill: "{{homeTeam.colors.primary}}" },
            visible: true, zIndex: 2, position: {x: 0, y: 0}, rotation: 0, opacity: 0.95,
            size: {width: 500, height: 1920},
            topWidth: 750
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
            dataKey: "homeTeam.logo",
            visible: true, zIndex: 1, position: {x: -50, y: 400}, size: {width: 500, height: 500}, rotation: 0, opacity: 0.95, objectFit: "contain",
            src: ""
          },
          {
            id: "away_big_logo",
            type: "Image",
            name: "Away Team Visual",
            dataKey: "awayTeam.logo",
            visible: true, zIndex: 2, position: {x: 600, y: 650}, size: {width: 450, height: 450}, rotation: 0, opacity: 0.95, objectFit: "contain",
            src: ""
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
            style: { fill: "#FFFFFF", fontFamily: "Inter", fontSize: 64, fontWeight: "bold", align: "left" },
            visible: true, zIndex: 2, position: {x: 100, y: 1200}, size: {width: 1000, height: 80}, rotation: -90, opacity: 0.7
          },
          {
            id: "home_name_box",
            type: "Shape",
            name: "Home Name Box",
            shapeType: "rect",
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
            shapeType: "rect",
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
            dataKey: "homeTeam.logo",
            src: "",
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
            dataKey: "awayTeam.logo",
            src: "",
            visible: true, zIndex: 10, position: {x: 750, y: 1470}, size: {width: 140, height: 140}, rotation: 0, opacity: 1, objectFit: "contain"
          },
          {
            id: "match_date",
            type: "Text",
            name: "Match Date",
            dataKey: "match.date",
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
            shapeType: "rect",
            style: { fill: "#000000" },
            visible: true, zIndex: 1, position: {x: 0, y: 1820}, size: {width: 1080, height: 100}, rotation: 0, opacity: 0.95
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
            shapeType: "rect",
            style: { fill: "#EAB308" },
            visible: true, zIndex: 3, position: {x: 280, y: 1845}, size: {width: 120, height: 40}, rotation: 0, opacity: 1
          },
          {
             id: "broadcaster_fake_2",
             type: "Shape",
             name: "Broadcaster Logo 2",
             shapeType: "rect",
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
        shapeType: "rect",
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
