# Asset Structure & Organization (Enterprise Bundle System)

RedPanda Forge uses a 3-tier Scope-based Taxonomy for assets to ensure templates are highly portable, encapsulated, and efficient. It separates visual media (`assets`) from dynamic JSON data (`data`).

This document defines the standard data structure for team colors used in generating **Thumbnails, Posters, and Banners** for sports graphics. It is designed to be lightweight, easy to maintain, and directly bindable to design templates.

## 1. Asset Resolution Pipeline (Tiers)

When referencing an image or asset in a `template.json`, the engine uses `Prefixes` to route the path correctly at runtime. Do **NOT** use hardcoded absolute URLs (e.g., `https://...`) in production setups.

| Prefix     | Scope              | Description                                           | Runtime Resolution (Example) |
| :---       | :---               | :---                                                  | :---                         |
| `@global/` | **System-Wide**    | Shared across all packs/templates (e.g. Logos, Flags) | `/assets/{path}`             |
| `@shared/` | **Pack-Level**     | Shared between templates inside the same Pack         | `/templates/{pack-id}/shared_assets/{path}` |
| `@local/`  | **Template-Level** | Strictly used by one specific template                | `/templates/{pack-id}/templates/{template-id}/local_assets/{path}` |
| `@system/` | **Fallback**       | System fallbacks for broken links                     | `/assets/_system/{path}`     |

## 2. Directory Taxonomy (`/public`)

To ensure a functional and scalable architecture, `assets` containing media files are separated from `data` containing JSON configuration.

### 2.1 The Global Data (`/public/data/`)

Global data represents real-world entities (teams, players). The folder names MUST match the Entity ID exactly to allow data binding (e.g., entity JSON file mappings).

```text
📁 public/
├── 📁 data/                            # ← Structured entities (metadata)
│   ├── 📁 soccer/
│   │   ├── 📁 teams/
│   │   │   ├── manchester-united.json  # Entity metadata for Man Utd
│   │   │   ├── manchester-city.json
│   │   │   └── arsenal.json
│   │   ├── 📁 players/
│   │   │   └── erling-haaland.json
│   │   └── 📁 competitions/
│   │       ├── premier-league.json
│   │       └── champions-league.json
│   │
│   ├── 📁 tennis/
│   ├── 📁 multi-sport/
│   │ 
│   └── 📁 common/
│       └── countries/                  # E.g.: vn.json, us.json
```

### 2.2 Why Not `@data/`?

**You do NOT need an `@data/` resolving prefix.** 

The `@global`, `@shared`, and `@local` prefixes are built exclusively for the **Konva Graphic Renderer (Template Engine)** to safely resolve visual *image pixels* (`src`) without hardcoding URLs inside templates. Data JSONs in `/public/data` represent pure domain state that are fetched normally via standard API/HTTP calls (`/data/...`) *before* the canvas starts rendering. Once your API loads the data, it populates the main state tree (`match`), allowing the template engine to use string mapping like `{{match.homeTeam.colors.primary}}` directly.

**Example Data Format (`manchester-city.json`):**

```json
{
  "id": "string",
  "name": "string",
  "shortName": "string",
  "colors": {
    "primary": "hex",
    "onPrimary": "hex",
    "secondary": "hex",
    "onSecondary": "hex",
    "tertiary": "hex | null",
    "onTertiary": "hex | null"
  },
  "assets": {
    "logo": "string",
    "kit": {
      "home": { "type": "home", "primary": "hex", "image": "string" },
      "away": { "type": "away", "primary": "hex", "image": "string" }
    }
  }
}
```

**Field Descriptions**


| Field | 	Type |	Description |
|:-- | -- |:-- |
| id  | `string` | Unique identifier for the team, lowercase with hyphens (e.g., manchester-united)
| name | `string` | Full official name of the club
| shortName | `string` | Abbreviation (3-4 chars), typically used in scoreboards or small thumbnails
| colors.primary | `hex` | Main brand color (home kit, primary logo color)
| colors.onPrimary | `hex` | Text/icon color when placed on primary background — ensures proper contrast
| colors.secondary | `hex` | Secondary color (away kit, borders, secondary text)
| colors.onSecondary | `hex` | Text/icon color when placed on secondary background
| colors.tertiary | `hex` or `null` | Tertiary accent color (e.g., gold/yellow for highlights). Set to null if team has only 2 colors
| colors.onTertiary | `hex` or `null` | Text/icon color when placed on tertiary. Set to null if tertiary is null


What Is NOT Included in This Schema

| Item | Reason for Exclusion |
|:-- | -- |
| neutral  | Neutral colors (black, white, gray) are interface constants, not team brand data. Handled by template CSS. |
| container, surface | Generated automatically from primary/secondary using CSS color-mix. |
| overlay | Overlay opacity (e.g., rgba(0,0,0,0.6)) is a design constant, handled by the template. |
| gradient | Generated dynamically in CSS using primary and secondary. |
| border, outline | Derived from primary color with adjusted lightness in CSS. |

```json
{
	"id": "manchester-city",
	"name": "Manchester City",
	"shortName": "MCI",
	"colors": {
		"primary": "#6CABDD",
		"onPrimary": "#1C2C5B",
		"secondary": "#1C2C5B",
		"onSecondary": "#FFFFFF",
		"tertiary": "#FFC659",
		"onTertiary": "#1C2C5B"
	},
	"assets": {
		"logo": "@global/soccer/teams/manchester-city/logo.svg",
		"kit": {
			"away": {
				"type": "away",
				"primary": "#000000",
				"image": ""
			}
		}
	}
}
```

### 2.3 The Global Assets (`/public/assets/`)

Visual media files are stored systematically matching their data entity counterparts where necessary. Keep paths clean and recognizable.

```text
📁 public/
├── 📁 assets/						# ← Media files (pure assets)
│   │
│   ├── 📁 soccer/
│   │   ├── 📁 teams/
│   │   │   ├── 📁 manchester-united/  # Entity ID as folder name
│   │   │   │   ├── logo.png            # Primary logo
│   │   │   │   ├── logo-white.png      # Monochrome (dark background)
│   │   │   │   ├── venue.jpg           # Old Trafford (high-res)
│   │   │   │   ├── jersey-home.png     # Home kit (line-up templates)
│   │   │   │   ├── jersey-away.png     # Away kit (line-up templates)
│   │   │   │   └── fans.jpg    # Crowd / atmosphere
│   │   │   │
│   │   │   ├── 📁 manchester-city/
│   │   │   └── 📁 arsenal/
│   │   │
│   │   ├── 📁 players/
│   │   │   └── 📁 erling-haaland/   # Player entity ID
│   │   │       ├── cutout-action.png  # Full-body action shot
│   │   │       ├── cutout-headshot.png  # Portrait (waist-up)
│   │   │       └── signature.png   # For "Player of the Match"
│   │   │
│   │   └── 📁 competitions/
│   │       └── 📁 premier-league/   # Competition entity ID
│   │           ├── logo-main.png
│   │           ├── trophy.png    # PL trophy cutout
│   │           ├── ball.png    # Official match ball
│   │           ├── background-hymn.jpg  # Branding background
│   │           └── 📁 venues/    # Stadium / arena photos
│   │               ├── emirates.png
│   │               └── anfield.jpg
│   │
│   ├── 📁 tennis/
│   │   └── 📁 competitions/
│   │       └── 📁 wimbledon/
│   │           ├── logo.png
│   │           ├── surface-grass.jpg  # Grass texture
│   │           └── trophy-men.png
│   │
│   ├── 📁 multi-sport/      # Olympics / ASIAD
│   │   └── 📁 olympic-paris-2024/
│   │       ├── 📁 disciplines/    # Sport pictograms
│   │       │   ├── archery.png
│   │       │   ├── swimming.png
│   │       │   └── gymnastics.png
│   │       │
│   │       └── 📁 venues/     # Stadium / arena photos
│   │           └── stade-de-france.jpg
│   │
│   ├── 📁 common/       # Shared across all sports
│   │   ├── 📁 countries/     # ISO alpha-2 flags
│   │   │   ├── vn.png
│   │   │   ├── us.png
│   │   │   └── fr.png
│   │   │
│   │   ├── 📁 event-icons/     # Action icons
│   │   │   ├── goal.svg     # Soccer goal
│   │   │   ├── red-card.sv     # Soccer discipline
│   │   │   ├── match-point.svg    # Tennis scoring
│   │   │   ├── knockout.svg    # Combat result
│   │   │   └── three-pointer.svg   # Basketball action
│   │   │
│   │   └── 📁 placeholders/    # Fallback assets
│   │       ├── default-player.png
│   │       ├── default-club.png
│   │       └── default-competition.png
│   │
│   ├── 📁 ui-elements/      # Tool-level UI assets
│   │   ├── 📁 badges/      # LIVE, REPLAY, EXCLUSIVE
│   │   ├── 📁 fonts/      # Typography
│   │   └── 📁 patterns/     # Textures / gradients
│   │
│   └── 📁 _system/       # Reserved (internal use)
│       └── 📁 placeholders/
│           ├── default-stadium.jpg
│           ├── default-team.jpg
│           └── default-player.png
```

### 2.3 The Templates Packs (`/public/templates/`)

A pack is a distribution unit containing templates mapped to a design identity.
If a template is single or imported independently, it defaults to the `/_default_pack/`.

```text
📁 public
└── 📁 templates/
    └── 📁 neon-matchday/               <-- Pack ID
        ├── pack.json                    <-- High level info (Author, version)
        ├── 📁 shared_assets/           <-- Theme files (@shared/)
        │   ├── bg-neon.webp          
        │   └── mask-grid.svg
        │
        └── 📁 templates/
            ├── 📁 lineup-16x9/         <-- Template ID
            │   ├── template.json
            │   └── /local_assets/      <-- Strictly scoped to lineup-16x9 (@local/)
            │       └── lineup-mask.png
            │
            └── 📁 halftime-16x9/
                ├── template.json
                └── /local_assets/
```
