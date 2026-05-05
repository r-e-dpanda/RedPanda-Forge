# RedPanda Forge - Agent Instructions & Canonical Development Guide

This document serves as the **persistent, authoritative record** of RedPanda Forge's technical architecture, conventions, and logic. **All developers must strictly follow these rules.**

---

## 1. Project Overview

RedPanda Forge is a high-performance template engine and desktop-class React editor for generating sports broadcast graphics, matchday thumbnails, and social media assets. It allows users to bind real-time match data to visual templates and customize them on a live canvas.

**Current Status** (May 5, 2026):

- React 19 + Vite 6 + TypeScript 5.8
- Electron integration ~90% complete (main process + preload ready)
- SQLite integration planned
- Multi-session editing with per-tab undo/redo
- Fully localized (EN + VI)

---

## 📐 System Architecture

```text
┌────────────────────────────────────────────────────────────────┐
│                     React App (Vite)                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           UI Layer (Components)                          │  │
│  │  ┌───────────────┬─────────────────┬──────────────────┐  │  │
│  │  │  LeftSidebar  │ EditorWorkspace │   RightPanel     │  │  │
│  │  │ • Sport       │ • EditorHeader  │ • Properties     │  │  │
│  │  │ • Matches     │ • Local Tabs    │ • Data Binding   │  │  │
│  │  │ • Templates   │ • Undo/Redo     │ • History        │  │  │
│  │  │               │ • Konva Canvas  │                  │  │  │
│  │  └───────────────┴─────────────────┴──────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │        State Management (Zustand)                        │  │
│  │  ┌───────────────┬───────────────┬────────────────────┐  │  │
│  │  │ editorStore   │settingsStore  │    Local State     │  │  │
│  │  │ • sessions    │ • themes      │ • UI selections    │  │  │
│  │  │ • overrides   │ • prefs       │ • form values      │  │  │
│  │  │ • history     │               │                    │  │  │
│  │  └───────────────┴───────────────┴────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Template Engine & Data Binding                   │  │
│  │  ┌─────────── ───┬───────────────┬────────────────────┐  │  │
│  │  │ templateEngine│  colorUtils   │  localization      │  │  │
│  │  │ • Pipes       │  • Contrast   │ • i18n / locales   │  │  │
│  │  │ • Resolvers   │  • Colors     │ • Rich Text        │  │  │
│  │  └───────────────┴───────────────┴────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Data & Asset Management                       │  │
│  │  ┌───────────────┬───────────────┬────────────────────┐  │  │
│  │  │  mockData     │ assetManager  │templateRegistry    │  │  │
│  │  │ • Matches     │ • Images      │ • Templates        │  │  │
│  │  │ • Teams       │ • Logos       │ • Library          │  │  │
│  │  └───────────────┴───────────────┴────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Data Storage (Future)                       │  │
│  │  • Electron: Local File System                           │  │
│  │  • Database: SQLite + Drizzle ORM                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```text
User Action (Click, Drag, Type)
           ↓
    UI Component Handler
           ↓
    ┌──────────────────────────────┐
    │  Update Zustand Store        │
    │  • editorStore               │
    │  • settingsStore             │
    └──────────────────────────────┘
           ↓
    ┌──────────────────────────────┐
    │  Process Override            │
    │  • elementOverrides          │
    │  • manualInputs              │
    │  • history tracking          │
    └──────────────────────────────┘
           ↓
    ┌──────────────────────────────┐
    │  Resolve Value               │
    │  1. Template Default         │
    │  2. Data Binding             │
    │  3. User Override (wins)     │
    └──────────────────────────────┘
           ↓
    ┌──────────────────────────────┐
    │  Apply Pipes                 │
    │  • inline transformations    │
    │  • formatting patterns       │
    │  • color operations          │
    └──────────────────────────────┘
           ↓
    ┌──────────────────────────────┐
    │  Render on Canvas            │
    │  • Konva Stage               │
    │  • Layer updates             │
    │  • Visual refresh            │
    └──────────────────────────────┘
           ↓
    User Sees Updated Graphics
```

---

## 2. Asset & Template Architecture (Enterprise Bundle System)

Assets and Templates are strictly separated concerns. Assets represent raw visual data (logos, placeholders), while Templates represent layout blueprints. RedPanda Forge uses a 3-tier Scope-based Taxonomy for assets to ensure templates are highly portable (can be zipped and shared as "Packs").

### 2.1 The "Pack" (Unit of Distribution)

A "Pack" is the standard distribution unit. It contains multiple templates that share a design concept (e.g., "Neon Matchday Pack"). Standalone imported templates fallback to a `_default_pack`.

**Pack Folder Structure:**

```text
pack.json                    # Metadata for the bundle
shared_assets/               # Assets used by multiple templates
templates/
  <template-id>/
    template.json            # Layout blueprint
    local_assets/            # Assets unique to this template
```

### 2.2 Asset Routing & Resolution Pipeline

To prevent hardcoded absolute URLs, the template engine employs a Context-Aware Prefix Resolver. Image elements specify their `src` using `@` prefixes, which are resolved at runtime depending on the actively loaded Pack and Editor configuration:

1. **`@global/`** (Domain Assets)
   - Scope: System-wide (All packs/templates)
   - Usage: `{"src": "@global/soccer/teams/{{match.homeTeam.id}}/logo.png"}`
   - Resolution: Maps to configured `assetRoot` (e.g., `/assets/soccer/...`)

2. **`@shared/`** (Theme Shared Assets)
   - Scope: Local to active Pack
   - Usage: `{"src": "@shared/backgrounds/neo-theme.jpg"}`
   - Resolution: Maps to `templateRoot/<pack-id>/shared_assets/`

3. **`@local/`** (Template-Specific Assets)
   - Scope: Local to specific Template
   - Usage: `{"src": "@local/masks/diagonal.png"}`
   - Resolution: Maps to `templateRoot/<pack-id>/templates/<template-id>/local_assets/`

Default configurable roots fallback to `/assets` and `/templates` relative to `window.location.origin`. MOCK_MATCH data should utilize string IDs (e.g., `mci`) instead of exact HTTP URLs so templates can dynamically build global asset paths using `{{match.homeTeam.id}}`.

---

## 3. Core Architecture & Resolution Logic

### 3.1 Property Resolution Order

The engine resolves visual elements by merging three layers of data:

1. **Template Base**: Default properties defined in template JSON
2. **Data Binding**: Dynamic values resolved from `match` object using `{{dot.notation}}` and "pipes"
3. **User Overrides**: Manual edits in the Editor Panel (highest priority), stored in `elementOverrides`

### 3.2 Template Hierarchy

- **`Template`**: Root object defining canvas size (`width`, `height`), `ratio`, and `sport`
- **`TemplateLayer`** (Groups): Organizational folders that group related elements. Handle visibility and expansion states. **Strictly a structural parent container.**
- **`TemplateElement`**: Actual rendered objects (`Text`, `Image`, `Shape`). **The rendered node.** Contains absolute positioning, styling, and interaction rules.

**Constraint**: Always keep `TemplateLayer` and `TemplateElement` separate. Never blur their responsibilities.

### 3.3 State Management (Zustand)

`src/stores/editorStore.ts` manages multiple editing **Sessions** (editor tabs). A `WorkflowSession` contains:

- `id`, `name`, `template`, `match`, `sport`
- `elementOverrides`: Map of style/position/text overrides (highest priority)
- `manualInputs`: User-provided values for data-bound fields not auto-resolved
- `history`, `historyIndex`: Undo/Redo stack **scoped to individual tab**

**Each tab is independent**: Switching tabs doesn't affect history or overrides in other tabs.

---

## 4. Template Syntax & Pipes

### 4.1 Binding Syntax

- `{{match.homeTeam.name}}`: Binds to data using dot-notation
- `{{homeTeam.colors.primary | contrast}}`: Inline pipeline with fallback

### 4.2 Supported Pipes

*Note: We strictly use inline pipes within `templateEngine.ts`. Do NOT create external file formatters like `src/lib/formatters.ts`.*

- `uppercase`, `lowercase`, `titlecase`: Text casing
- `number`: Formats as `1,234.56`
- `boolean:Yes:No`: Converts truthy/falsy to strings
- `date:format` & `time:format`: `date-fns` formatting (e.g., `dd/MM/yyyy`, `HH:mm`)
- `contrast`: Resolves a color (White/Black) that contrasts with input
- `shorten:len`: Truncates with ellipses
- `prefix:str` / `suffix:str`: Appends/Prepends strings
- `replace:old:new`: Replaces substrings
- `json`: Pretty-prints array/object data

---

## 5. UI, Interaction, & Localization Logic

### 5.1 Panel Conventions & Semantics

- **Left Sidebar (Global Explorer)**: Cross-session resources (Sport selection, Match list, Template thumbnails). Drives global state, independent of canvas.
- **Right Panel (Contextual Inspector)**: Strictly contextual. Represents properties of currently selected element. Contextual to active session.
- **Editor Workspace (Center)**:
  - **Editor Header**: Session Tab Bar + localized actions (Undo, Redo, Export)
  - **Localized Actions**: Document-specific controls must remain within editor workspace

### 5.2 Responsive Scaling (Rem & CSS Variables)

To ensure interface scales globally via "UI Scale" settings slider:

- **No Hardcoded `px` Widths/Heights**: Structural boundaries (Sidebar, Header) MUST use `rem` values (e.g., `w-[17.5rem]`)
- **Global Injection**: Slider dynamically updates `document.documentElement.style.fontSize` so Tailwind classes respond automatically
- **No component logic changes needed**: Scaling happens purely through CSS variable injection

### 5.3 Localization (i18n)

All UI strings route through `useTranslation()` context from `src/lib/i18n.tsx`.

- **Dictionaries**: Stored in `src/locales/` (e.g., `en.ts`, `vi.ts`)
- **Rich Text / JSX**: Use array structural parsing replacing `{tag}...{/tag}` markers instead of dangerously setting inner HTML
- **Support**: Currently EN + VI. Easy to add more

### 5.4 Right Panel: Source vs Value Logic

To clarify between data engine values and manual overrides:

- **Source (Binding)**:
  - Renamed from "Binding"
  - **Durable Display**: Always shows underlying template binding (e.g., `awayTeam.name` or `{{match.score}})` even if manual override active
  - If user overrides with static value, Source field remains populated to maintain context

- **Value (Override)**:
  - Allows manual static overrides that "win" over source
  - **Reset** button appears on label ONLY when override active
  - Clears override, reverts visual result to resolved Source value

- **Data Source Resolution**:
  - Extract keys from inline bindings (e.g., `{{colors.primary}}`) even if root `dataKey` missing
  - Color bindings must display current HEX code (e.g., `#FF0000`) instead of `N/A`

- **Placeholder Logic**:
  - **Non-Text (Fill/Source)**: If bound, show `[resolvedValue]`
  - **Text Elements**:
    - If **Transformation Active** (formatters applied), show `[transformedValue]`
    - If no transformation, show `[resolvedValue]` directly
  - **Static Value**: Context-aware (e.g., `#FFFFFF`, `Rendered value...`)

### 5.5 Interaction Rules

- **Sport Switching**: Changes active tab's sport context (doesn't create/delete tabs)
- **Active Tab Sync**: Changing tab updates Sport Dropdown to match tab's sport
- **Scaling**: `KonvaEditor` calculates dynamic scale to fit canvas while maintaining aspect ratio
- **Ratio & Template Filtering**:
  - When user changes Ratio filter and no templates found: Template dropdown disabled
  - `activeTemplate` NOT cleared automatically. Remains active until user explicitly changes
- **New Session**: "+" button creates "Untitled Graphic" inheriting current sport
- **Safety (Dirty Checks)**: Switching templates or closing session triggers confirmation if "dirty" (has unsaved overrides or unsynced history)

---

## 6. Design System & Themes (Externalized)

Themes managed via `src/constants/themes.json`. Single source of truth for all visual styles.

### 6.1 Theme Structure

Each theme (Dark, Light, Custom) contains:

- **Color Palette**: `--app-bg`, `--app-sidebar`, `--app-border`, `--app-text`, `--app-muted`, `--app-accent`, etc.
- **Semantic Colors**: `--app-success`, `--app-warning`, `--app-danger`, `--app-info`
- **Typography**: Font families, sizes (via ui.ts scales)
- **Spacing**: Padding, gaps, margins
- **Shadows**: Subtle drop shadows for depth

### 6.2 Implementation

The `applyTheme` utility (`src/lib/themeUtils.ts`) injects `themes.json` values as CSS variables (`--app-*`) into document root. Also manages `.dark` class on `<html>` for **shadcn/ui** dynamic dark mode.

**Theming Constraint**: ALWAYS use `app-` Tailwind classes (e.g., `bg-app-bg`) or shadcn's utility classes. shadcn components mapped to `app-` variables in `src/index.css` ensure they adapt automatically.

---

## 7. UI Components, shadcn/ui & Naming Conventions

We use **shadcn/ui** (built on Tailwind CSS and Radix UI) for all standard interface elements.

- **Storage**: Components in `src/components/ui/`
- **Utils**: Helper `cn()` function in `src/lib/utils.ts`
- **Path Aliases**: Use `@/components/ui/...` and `@/lib/...` (mapped to `src/`)
- **Standardized Elements**: `Button`, `Input`, `Select`, `Tabs`, `Slider`, `Dialog`, `Separator`

### 7.1 File Naming Conventions

- **Primitive Components (`kebab-case` lowercase)**: `src/components/ui/button.tsx`, `select.tsx` — zero business logic, pure building blocks
- **Smart/Composite Components (`PascalCase`)**: `RightPanel.tsx`, `EditorWorkspace.tsx` — actual features, layout sections, stateful views

---

## 8. Development Principles

- **Icons**: STRICTLY import from `lucide-react`. No custom SVGs.
- **Geometric Accuracy**:
  - For slanted dividers, prefer **Parallelogram** (Rectangle + `skewX`) over invalid trapezoid
  - Modern quads use `topWidth` to define trapezoidal shapes, baseline `width` remains primary anchor
  - **Element Dimensions**: May be in `size` object (e.g., `size.width`) or root. Utilities MUST gracefully fallback to `element.size?.width`
  - **Quad/rect shapes**: If `topWidth` omitted, MUST fallback to `element.width` or `element.size?.width` to ensure true rectangle
- **Safety**: No destructive actions without state checking (dirty checks)
- **Gracefulness**: Edge cases (empty state, no data) should show helpful placeholders
- **Performance**: Use `react-konva` for rendering. JSON layout descriptions instead of static PNGs

---

## 9. Transformation & Coordinate System

### 9.1 Stationary Center Pivot

All elements use a **Stationary Center Pivot** model:

- **Rotation**: Occurs around geometric center
- **Skew X**: Leans symmetrically from center. Top/bottom edges move opposite directions, center fixed.
- **Flip X/Y**: Mirrors relative to center axes

### 9.2 Selection UI Indicators

1. **Geometric Outline**: Blue outline follows actual vertices, including skew effects
2. **Pivot Crosshair**: Crosshair indicates center pivot—rotates with element but remains perpendicular
3. **Layout Anchor**: Dashed rectangle at top-left represents logical `(X, Y)` position

---

## 10. Code Organization Standards

### 10.1 Import Paths

Use path aliases consistently:

```ts
import { useEditorStore } from '@/stores/editorStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
```

### 10.2 Component Structure

```tsx
// 1. Imports (React, libraries, types, components)
// 2. Type definitions / interfaces
// 3. Component function
// 4. Internal sub-components (if any)
// 5. Export
```

### 10.3 Store Usage

Keep stores focused:

- `editorStore.ts` — Canvas, selections, sessions, history
- `settingsStore.ts` — UI preferences, theme, scale

Don't create ad-hoc stores. Extend existing ones.

---

## 11. Common Pitfalls to Avoid

❌ **Hardcoding colors/styles** → Use `app-*` CSS variables  
❌ **Creating new stores** → Extend existing ones  
❌ **Destructive actions without checks** → Always confirm with user  
❌ **Mixing concerns** (Layer + Element logic) → Keep separate  
❌ **Using custom formatters** → Use inline pipes only  
❌ **Ignoring type errors** → Fix before committing  
❌ **Hardcoded `px` measurements** → Use `rem` for structural boundaries

---

---

**Last Updated**: May 5, 2026  
**Status**: ✅ Canonical  
**Author**: RedPanda Development Team

This document is the single source of truth. All other documentation should reference this guide.
