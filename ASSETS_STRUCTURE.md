# Asset Structure & Organization (Enterprise Bundle System)

RedPanda Forge uses a 3-tier Scope-based Taxonomy for assets to ensure templates are highly portable, encapsulated, and efficient.

## 1. Asset Resolution Pipeline (Tiers)

When referencing an image or asset in a `template.json`, the engine uses `Prefixes` to route the path correctly at runtime. Do **NOT** use hardcoded absolute URLs (e.g., `https://...`) in production setups.

| Prefix | Scope | Description | Runtime Resolution (Example) |
| :--- | :--- | :--- | :--- |
| `@global/` | **System-Wide** | Shared across all packs/templates (e.g. Logos, Flags) | `/assets/{path}` |
| `@shared/` | **Pack-Level** | Shared between templates inside the same Pack | `/templates/{pack-id}/shared_assets/{path}` |
| `@local/` | **Template-Level** | Strictly used by one specific template | `/templates/{pack-id}/templates/{template-id}/local_assets/{path}` |
| `@system/` | **Fallback** | System fallbacks for broken links | `/assets/_system/{path}` |

## 2. Directory Taxonomy (`/public`)

### 2.1 The Global Assets (`/public/assets/`)
Global assets represent real-world entities (teams, players). The folder names MUST match the Entity ID exactly to allow data binding (e.g., `{"src": "@global/soccer/teams/{{match.homeTeam.id}}/logo.png"}`). 

The entity structure often includes a `team.json` (or `player.json`) file holding business logic, meaning the team is not just an image, but a structured Entity.

```text
📁 assets/
│
├── 📁 soccer/
│   ├── 📁 teams/
│   │   ├── 📁 manchester-united/       # Entity ID as Folder Name
│   │   │   ├── team.json               # Team metadata
│   │   │   ├── logo.png                # Primary logo
│   │   │   ├── logo-white.png          # Monochrome version for dark backgrounds
│   │   │   ├── stadium.jpg             # Old Trafford high-res image
│   │   │   ├── jersey-home.png         # Home kit for line-up templates
│   │   │   └── fans.jpg                # Crowd/Atmosphere photo
│   │  	├── 📁 manchester-city/ 
│   │   └── 📁 arsenal/
│   │
│   ├── 📁 players/
│   │   └── 📁 erling-haaland/              # Player Entity ID
│   │       ├── player.json                 # Player metadata
│   │       ├── cutout-action.png           # Action shot (full body)
│   │       ├── cutout-headshot.png         # Portrait (waist up)
│   │       └── signature.png               # Digital signature for "Player of the match"
│   │
│   └── 📁 competitions/
│       └── 📁 premier-league/              # Competition Entity ID
│           ├── competition.json            # Competition metadata
│           ├── logo-main.png          
│           ├── trophy.png                  # The PL Trophy cutout
│           ├── ball.png                    # Official match ball
│           └── background-hymn.jpg         # Iconic PL branding background
│           └── 📁 venues/                  # Stadium/Arena photos
│   	        ├── emirates.png
│               └── anfield.jpg
│
├── 📁 tennis/
│   └── 📁 competitions/
│       └── 📁 wimbledon/
│           ├── competition.json            # Competition metadata
│           ├── logo.png
│           ├── surface-grass.jpg      # Grass texture for backgrounds
│           └── trophy-men.png         
│
│
├── 📁 multi-sport/                      # For Games like Olympics/ASIAD
│   └── 📁 olympic-paris-2024/           
│       ├── 📁 disciplines/              # Sport icons (Pictograms)
│       │   ├── archery.png
│       │   ├── swimming.png
│       │   └── gymnastics.png
│       └── 📁 venues/                   # Stadium/Arena photos
│           └── stade-de-france.jpg
│
├── 📁 common/                           # Shared assets across all sports
│   ├── 📁 countries/                    # National flags (ISO alpha-2 code)
│   │   ├── vn.png
│   │   ├── us.png
│   │   └── fr.png
│   ├── 📁 event-icons/                  # Action icons based on sports data
│   │   ├── goal.svg                   # Soccer goal
│   │   ├── red-card.svg               # Soccer disciplinary
│   │   ├── match-point.svg            # Tennis scoring state
│   │   ├── knockout.svg               # Combat result
│   │   └── three-pointer.svg          # Basketball action
│   └── 📁 placeholders/                 # Fallback images
│       ├── default-player.png
│       ├── default-club.png
│       └── default-competition.png
│
├── 📁 ui-elements/                      # Global UI assets for the productivity tool
│   ├── 📁 badges/                       # System badges (LIVE, REPLAY, EXCLUSIVE)
│   ├── 📁 fonts/                        # Shared typography files
│   └── 📁 patterns/                     # Common textures or gradients
│
└── 📁 _system/                          # System-reserved (using underscore)
    └── 📁 placeholders/
        ├── default-stadium.jpg
        ├── default-team.jpg		
        └── default-player.png
```

### 2.2 `Team.assets`
Every team can optionally declare its metadata and assets cleanly:

```json
{
  "id": "manchester-city",
  "name": "Manchester City",
  "shortName": "MCI",
  "colors": {
    "primary": "#6CABDD",
    "secondary": "#FFFFFF",
    "accent": "#1C2C5B"
  },
  "assets": {
    "logo": "@global/soccer/teams/manchester-city/logo.png",
    "kit": {
      "away": { "type": "away", "primary": "#000000", "image": "" }
    }
  }
}
```

### 2.3 The Templates Packs (`/public/templates/`)
A pack is a distribution unit containing templates mapped to a design identity. 
If a template is single or imported independently, it defaults to the `/_default_pack/`.

```text
/public
└── /templates/
    └── /neon-matchday/               <-- Pack ID
        ├── pack.json                 <-- High level info (Author, version)
        ├── /shared_assets/           <-- Theme files (@shared/)
        │   ├── bg-neon.webp          
        │   └── mask-grid.svg
        │
        └── /templates/
            ├── /lineup-16x9/         <-- Template ID
            │   ├── template.json
            │   └── /local_assets/    <-- Strictly scoped to lineup-16x9 (@local/)
            │       └── lineup-mask.png
            │
            └── /halftime-16x9/
                ├── template.json
                └── /local_assets/
```
