# RedPanda Forge - Agent Instructions & Project Wiki

This file contains accumulated knowledge, UX rules, and architectural guidelines for RedPanda Forge. **You must strictly follow these rules when assisting the user.**

## 1. Asset Structure (ASSETS_STRUCTURE)
All static assets and mock data are structured carefully inside the `/public` folder to facilitate dynamic loading on the canvas.
- **Team Logos:** `/public/[sport]/[league]/[team_name_or_shortname].png`
  - Example: `/public/football/premier-league/MCI.png`
  - Example: `/public/basketball/nba/GSW.png`
- **Templates:** `/public/templates/[sport]/[ratio]/`
  - Example backgrounds: `/public/templates/football/16-9/bg-1.png`
- **Mock Data:** MOCK_MATCHES in `src/lib/mockData.ts` (or similar) handles the match definitions.

## 2. Core UX & Interaction Logic
- **Sport Switching (Dropdown):** 
  - Changing the sport must **NOT** close the current tab or prompt the user. 
  - **Logic:** Find the first existing tab for the chosen sport -> If none, find an empty "Untitled Graphic" tab -> If none, create a new tab. Finally, set it as Active.
- **Active Tab Sync:** 
  - Changing the Active Tab must automatically update the Sport Dropdown to match the active tab's sport (`activeSession.template?.sport || activeSession.match?.sport`).
- **Closing Tabs (X Icon using `lucide-react`'s `X`):**
  - **Clean Tab:** Close immediately without prompt.
  - **Dirty Tab:** Prompt the user with a modal (Export & Close, Discard & Close, Cancel).
  - *Definition of Dirty:* The session has `historyIndex >= 0`, `elementOverrides`, or `manualInputs`.
- **Batch Generation:** 
  - Users can generate multiple graphics at once based on an active match and a list of filtered templates.

## 3. Architecture & State Management
- **Zustand (`useEditorStore`):** Manages the global state of the editor via **Sessions** (editor tabs).
- **Session Types:** Defined in `src/types/template.ts` or `src/stores/editorStore.ts`. A `WorkflowSession` contains:
  - `id`, `name`, `template`, `match`
  - `elementOverrides` (style/position tweaks)
  - `manualInputs` (text overwrites)
  - `history`, `historyIndex` (for Undo/Redo scoped to the individual tab)
- **Data Rendering Engine:** Uses `react-konva` (Canvas) for high-performance rendering. Overlays (translucent backgrounds, trapezoids) can be described dynamically using JSON layout descriptions rather than static hardcoded PNGs where possible.

## 4. Design Guidelines
- **Icons:** STRICTLY import from `lucide-react`.
- **CSS:** Use Tailwind CSS with custom CSS variables defined in `/src/index.css`.
- **Color Palette:** The app utilizes a "Dark Mode First" scheme (`app-bg`, `app-sidebar`, `app-border`, `app-accent`) configured via Tailwind classes and variables.

## 5. Development Principles
- Do not introduce destructive prompts without checking state (e.g., dirty checks).
- Handle edge cases gracefully: opening the app with no data, closing the very last tab (should spawn a fresh one), and switching contexts.
