# Asset Configuration & Best Practices

With the expansion of the Application to support a wide range of custom assets dynamically (and prepare for future CDN/cloud migrations), the core Data Engine has been upgraded to support deep path resolutions and intelligent fallback mechanisms.

This document serves as the central documentation for managing standard and custom assets inside RedPanda Forge templates.

## Directory Structure

In the future, whether these files are deployed inside an Electron `userData` local folder or pushed to a CDN like AWS S3 or Cloudflare R2, the path taxonomy will be identical.

```text
📁 assets/
├── 📁 competitions/      # League or tournament logos and trophies
│   ├── 📁 football/
│   │   ├── 📁 premier-league/
│   │   │   ├── logo.png
│   │   │   └── trophy.png
│   │   └── 📁 champions-league/
├── 📁 teams/             # Everything related to the team
│   └── 📁 football/
│       └── 📁 premier-league/
│           ├── 📁 manutd/
│           │   ├── logo.png
│           │   ├── badge.png
│           │   └── kit_home.png
│           └── 📁 liverpool/
├── 📁 players/           # Distinct player profile cutouts and assets
│   └── 📁 tennis/
│       └── 📁 djokovic/
│           └── image.png 
├── 📁 backgrounds/       # Wallpapers, abstract backgrounds
│   └── 📁 football/
│       └── dark-stadium.jpg
├── 📁 overlays/          # Visual effects overlay (gradients, glows)
│   ├── gradients/
│   │   └── dark-left.png
├── 📁 textures/          # Abstract textures / noises / grunge
├── 📁 fonts/             # Custom .ttf/.woff fonts 
├── 📁 icons/             # Custom SVG icons 
└── 📁 previews/          # Thumbnails of the generated templates
```

## Data Object Models

We have upgraded the core Domain Models inside `src/types/template.ts` to reflect the structure proposed.

### 1. `Team.assets`
Every team can optionally declare its assets cleanly:

```json
{
  "id": "t_mu",
  "name": "Manchester United",
  "colors": {
    "primary": "#DA291C",
    "secondary": "#000000",
    "accent": "#FBE122"
  },
  "assets": {
    "logo": "https://cdn.example.com/teams/football/premier-league/t_mu/logo.png",
    "badge": "https://cdn.example.com/teams/football/premier-league/t_mu/badge.png",
    "kit": {
      "home": { "type": "home", "primary": "#DA291C", "image": "..." },
      "away": { "type": "away", "primary": "#000000", "image": "..." }
    },
    "background": "https://cdn.example.com/teams/football/premier-league/t_mu/bg.png"
  }
}
```

### 2. Match Custom Overrides
Sometimes an away team has to wear their Third Kit because of color clashing. You can override it dynamically per match:
```json
{
  "awayTeamOverrides": {
    "kit": {
      "type": "away",
      "primary": "#000000" // We force them to wear black
    }
  }
}
```

## Template Engine: Deep Path Bindings

To fully utilize this new flexible structure, the template engine now natively supports **deep dot-notation path traversing**. You no longer need to write custom logic in the engine for new properties!

If you add a field like `team.colors.accent` to the JSON match data, you can immediately use it in the visual editor via `dataKey`:
- `dataKey`: `homeTeam.colors.primary` -> resolves to `#DA291C`
- `dataKey`: `match.competition.trophy` -> resolves to `https://.../trophy.png`

## Template Engine: `contrast` Pipeline

Contrast calculation is extremely critical to prevent unreadable text. We built a native **pipeline resolver**.

When binding the `style.fill` or `style.stroke` inside the RightPanel, you can use the pipe syntax `| contrast` inside the input box, or add it to the template element directly:

```json
{
  "id": "team_name_text",
  "type": "Text",
  "text": "{{homeTeam.name}}",
  "style": {
     "fill": "{{homeTeam.colors.primary | contrast}}" 
  }
}
```
If `homeTeam.colors.primary` is `#FFFFFF` (White), the engine converts `{{... | contrast}}` to `#000000` (Black) automatically.

### Implemented Pipes:
- `| contrast`: Computes YIQ threshold to return `#000000` or `#FFFFFF` protecting text legibility.
- `| uppercase`
- `| lowercase`

*No heavy state management overhead, no over-engineering. Just clean structural paths & declarative pipes.*
