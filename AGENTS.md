# RedPanda Forge - Agent Instructions & Project Wiki

This document serves as a persistent record of RedPanda Forge's technical architecture, conventions, and key logic to ensure consistency across development iterations. **You must strictly follow these rules when assisting the user.**

## 1. Project Overview
RedPanda Forge is a high-performance template engine and editor for sports broadcast graphics. It allows users to bind real-time match data to visual templates and customize them on a live canvas.

## 2. Asset & Template Architecture (Enterprise Bundle System)
Assets and Templates are strictly separated concerns. Assets represent raw visual data (logos, placeholders), while Templates represent layout blueprints. RedPanda Forge uses a 3-tier Scope-based Taxonomy for assets to ensure templates are highly portable (Can be zipped and shared as "Packs").

### 2.1 The "Pack" (Unit of Distribution)
A "Pack" is the standard distribution unit. It contains multiple templates that share a design concept (e.g., "Neon Matchday Pack"). Standalone imported templates fallback to a `_default_pack`.
- **Pack Folder Structure:**
  - `pack.json` - Metadata for the bundle.
  - `shared_assets/` - Assets used by multiple templates in this pack.
  - `templates/`
    - `<template-id>/`
      - `template.json` - The actual layout blueprint.
      - `local_assets/` - Assets explicitly unique to this template.

### 2.2 Asset Routing & Resolution Pipeline
To prevent hardcoded absolute URLs, the template engine employs a Context-Aware Prefix Resolver. Image elements specify their `src` using `@` prefixes, which are resolved at runtime depending on the actively loaded Pack and Editor configuration:

1. **`@global/`** (Domain Assets)
   - Scope: System-wide (All packs/templates).
   - Usage: `{"src": "@global/soccer/teams/{{match.homeTeam.id}}/logo.png"}`
   - Resolution: Maps to the configured `assetRoot` (e.g., `/assets/soccer/...`).
2. **`@shared/`** (Theme Shared Assets)
   - Scope: Local to the active Pack.
   - Usage: `{"src": "@shared/backgrounds/neo-theme.jpg"}`
   - Resolution: Maps to `templateRoot/<pack-id>/shared_assets/`.
3. **`@local/`** (Template-Specific Assets)
   - Scope: Local to the specific Template.
   - Usage: `{"src": "@local/masks/diagonal.png"}`
   - Resolution: Maps to `templateRoot/<pack-id>/templates/<template-id>/local_assets/`.

Default configurable roots fallback to `/assets` and `/templates` relative to `window.location.origin`. MOCK_MATCH data should utilize string IDs (e.g. `mci`) instead of exact HTTP URLs so templates can dynamically build global asset paths using `{{match.homeTeam.id}}`.

## 3. Core Architecture & Resolution logic

### Property Resolution Order
The engine resolves visual elements by merging three layers of data:
1. **Template Base**: Default properties defined in the template JSON (`src/types/template.ts`).
2. **Data Binding**: Dynamic values resolved from the `match` object using `{{dot.notation}}` and "pipes".
3. **User Overrides**: Manual edits performed in the Editor Panel (highest priority), stored in `elementOverrides`.

### State Management (Zustand)
`src/stores/editorStore.ts` manages multiple editing **Sessions** (editor tabs). A `WorkflowSession` contains:
- `id`, `name`, `template`, `match`.
- `elementOverrides`: Map of style/position/text overrides.
- `manualInputs`: User-provided values for data-bound fields not auto-resolved.
- `history`, `historyIndex`: Undo/Redo stack scoped to the individual tab.

## 4. Template Syntax & Pipes

### Binding Syntax
- `{{match.homeTeam.name}}`: Binds to data using dot-notation.
- `{{homeTeam.colors.primary | contrast}}`: Inline pipeline binding with fallback.

### Supported Pipes (`src/lib/templateEngine.ts`)
- `uppercase`, `lowercase`, `titlecase`: Text casing.
- `number`: Formats as `1,234.56`.
- `boolean:Yes:No`: Converts truthy/falsy values to strings.
- `date:format` & `time:format`: `date-fns` formatting (e.g., `dd/MM/yyyy`, `HH:mm`).
- `contrast`: Resolves a color (White/Black) that contrasts with the input color.
- `shorten:len`: Truncates text with ellipses.
- `prefix:str` / `suffix:str`: Appends/Prepends strings.
- `replace:old:new`: Replaces substrings.
- `json`: Pretty-prints array/object data.

## 5. UI & Interaction Logic

### Panel Conventions
- **Left Sidebar**: Sport selection, Match list, and Template thumbnails.
- **Editor Workspace (Center)**: 
  - **Editor Header**: Contains the **Session Tab Bar** and localized actions (**Undo**, **Redo**, **Export**).
  - **Localized Actions**: Document-specific controls (Save/Export) must remain within the editor workspace context.
- **Right Panel**: 
  - **Match Tab**: Data source selection and raw data binding overview.
  - **Editor Tab**: Property controls (sliders, color pickers, text inputs) for the selected element.

### 5.2 Right Panel Input Feedback (Source vs Value Logic)
To provide clarity between data engine values and manual overrides, the Design tab distinguishes between the **Source** (where data comes from) and the **Value** (the actual content).

- **Source (Binding)**: 
  - Renamed from "Binding" to "Source".
  - **Durable Display**: The Source field must always show the underlying template binding (e.g., `awayTeam.name` or `{{match.score}}`) even if a manual override is active.
  - **Behavior**: If the user overrides with a non-binding value (e.g., a static hex code or string), the Source field remains populated with the template's data key to maintain context.
- **Value (Override)**:
  - This field allows manual static overrides that "win" over the source.
  - **Reset**: A "Reset" button appears on the label of this field ONLY when an override is active. It clears the override and reverts the visual result to the resolved Source value.
- **Data Source Resolution (Right Panel)**:
  - The Data Sources list must correctly extract keys from inline bindings (e.g., `{{colors.primary}}`) even if a root `dataKey` is missing.
  - **Color Bindings**: Resolved values for shape colors (Fill/Stroke) must display the current HEX code (e.g., `#FF0000`) instead of `N/A`.
- **Placeholder Logic**:
  - **Non-Text (Fill/Source)**: If bound, show `Bind to [resolvedValue]`.
  - **Text Elements**:
    - If **Transformation Active** (formatters applied), show `Parsed as [transformedValue]`.
    - If no transformation, show the `[resolvedValue]` directly.
  - **Static Value**: Default to context-aware placeholders (e.g., `#FFFFFF`, `Rendered value...`).

### Interaction Rules
- **Sport Switching**: Changing the sport dropdown must **NOT** close the current tab. 
  1. It first searches for an existing tab for the chosen sport (where match or template matches).
  2. If none found, it searches for an existing **Empty Tab** ("Untouched" session: no match, no template, no history) to reuse.
  3. Only if no suitable tab is found does it create a new "Untitled Graphic" session.
- **Active Tab Sync**: Changing the Active Tab automatically updates the Sport Dropdown to match the active tab's context.
- **Scaling**: `KonvaEditor` calculates a dynamic scale to fit the canvas while maintaining aspect ratio (Desktop-first).
- **Safety (Dirty Checks)**: 
  - Switching templates or closing a session triggers a confirmation dialog if the session is "dirty" (i.e., has unsaved manual overrides or unsynced history).

## 6. Design Guidelines & Themes (EXTERNALISED)
Themes are now managed via `src/constants/themes.json`. This file acts as the single source of truth for all visual styles.

### A. Dark (Iron & Sulfur) - Standard Default
- **Mood**: High-contrast, industrial, authoritative.
- **Colors**: Defined in `themes.json` (dark).

### B. Icy Mint (Aqua Light) - Modern & Crisp
- **Mood**: Fresh, high-contrast aqua/mint workspace optimized for focus and long-term productivity.
- **Colors**:
  - `bg`: `#f5fffa` (Mint Cream)
  - `sidebar`: `#e0f2f1` (Light Aqua)
  - `text`: `#1a3a3a` (Deep Teal - High Contrast)
  - `accent`: `#20b2aa` (Light Sea Green)

### C. Studio Light - Minimal & Clean
- **Mood**: Editorial, light, airy workspace.

### Implementation Logic
The `applyTheme` utility (`src/lib/themeUtils.ts`) injects `themes.json` values as CSS variables (`--app-*`) into the document root. It also manages the `.dark` class on the `<html>` element to enable **shadcn/ui**'s dynamic dark mode. 

**Theming Constraint**: ALWAYS use `app-` Tailwind classes (e.g., `bg-app-bg`) or shadcn's utility classes. shadcn components are mapped to `app-` variables in `src/index.css` to ensure they adapt automatically to theme changes.

## 7. UI Components & shadcn/ui
We use **shadcn/ui** (built on tailwindcss and radix-ui) for all standard interface elements to provide a professional and accessible experience.

- **Storage**: Components are located in `src/components/ui/`.
- **Utils**: Helper `cn()` function is in `src/lib/utils.ts`.
- **Path Aliases**: Use `@/components/ui/...` and `@/lib/...` for imports (mapped to `src/`).
- **Standardized Elements**:
  - `Button`, `Input`, `Select`, `Tabs`, `Slider`, `Dialog`, `Separator`.
  - Use these instead of native HTML elements for consistency and accessibility.

## 8. Development Principles
- **Icons**: STRICTLY import from `lucide-react`. Do not use custom SVGs.
- **Geometric Accuracy**: 
  - For slanted dividers (e.g., "Home Quad"), always prefer a **Parallelogram** (Rectangle + `skewX`) over an invalid trapezoid.
  - Modern quads use `topWidth` to define trapezoidal shapes, ensuring the baseline `width` remains the primary layout anchor.
  - **Element Dimensions (Size vs Root):** Elements may define their dimensions inside a `size` object (e.g., `size.width`, `size.height`) instead of at the root of the element object. To prevent accidental geometric deformations, utilities (e.g., `shapeUtils.ts`) MUST gracefully fallback to `element.size?.width` / `element.size?.height`.
  - For `quad` / `rect` shapes, if `topWidth` is omitted, it MUST fallback to `element.width` or `element.size?.width` to ensure the shape defaults to a true rectangle, rather than an arbitrary skewed trapezoid value (like `100`).
- **Safety**: Do not introduce destructive actions without checking state (dirty checks).
- **Gracefulness**: Handle edge cases: opening the app with no data should show a helpful empty state.
- **Performance**: Use `react-konva` for rendering. Use JSON layout descriptions instead of static PNGs where possible.

## 9. Transformation & Coordinate System

### Stationary Center Pivot
To ensure predictable transformations, RedPanda Forge uses a **Stationary Center Pivot** model for all elements (Shapes, Text, Images):
- **Rotation**: Occurs around the geometric center of the element.
- **Skew X**: Leans the shape symmetrically from the center. The top and bottom edges move in opposite directions, keeping the center point fixed on the canvas.
- **Flip X/Y**: Mirrors the element relative to its center axes.

### Selection UI Indicators
The editor provides visual feedback to distinguish between layout and visual state:
1.  **Geometric Outline**: A blue outline follows the actual vertices (corners) of the transformed shape, including skew effects.
2.  **Pivot Crosshair**: A technical crosshair indicates the center pivot point—the soul of all transformations. It rotates with the element but remains unskewed (perfectly perpendicular) to ensure technical clarity.
3.  **Layout Anchor**: A dashed rectangle/indicator at the top-left represents the logical `(X, Y)` position stored in the data, clarifying the coordinate system's origin.
