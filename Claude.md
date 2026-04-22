# SportForge Thumbnail Generator

## Overview

SportForge is a desktop-class React application (currently being migrated/setup for Electron) designed to generate high-quality sports graphics, matchday thumbnails, and social media assets. It combines a dynamic data-binding engine with a visual canvas editor.

## Tech Stack

- **Frontend Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + custom UI components
- **Canvas Rendering:** `react-konva` & `use-image`
- **Icons:** `lucide-react`
- **Future Backend (Local):** Electron, SQLite, Drizzle ORM (WIP)

## Core Architecture & Data Model

### 1. Templating System

Templates are robust data structures mimicking professional design tools:

- **`Template`**: The root object defining canvas size (`width`, `height`), `ratio`, and `sport`.
- **`TemplateLayer` (Groups)**: Organizational folders that group related visual elements together (e.g., "Background Group", "Teams & Matchup"). Layers handle visibility and expansion states.
- **`TemplateElement`**: The actual rendered objects (`Text`, `Image`, `Shape`). These contain absolute positioning (`x`, `y`, `width`, `height`), styling (`fill`, `fontFamily`, `fontSize`), and interaction rules (`draggable`, `editableProperties`).

### 2. Data Binding Engine

- **Mock Data (`Match`)**: Contains specific match information (Teams, Date, Venue, Badges).
- **Binding (`dataKey`)**: `TemplateElement`s can specify a `dataKey` (e.g., `homeTeam.name`). The system automatically maps match data to the visual canvas. If no auto-binding is found, it falls back to manual user inputs.

### 3. Editor Workspace

- **Canvas (`EditorWorkspace.tsx`)**: Renders the konva stage, handles zoom/fit calculations, drag & drop, and highlight interactions.
- **Overrides**: Users can drag elements or change their properties from the right panel. These modifications are stored in a state dictionary (`elementOverrides`) mapped by element ID, preserving the original unmutated template.

## State of the Project (Current Progress)

- [x] Left Sidebar (Match selection, Template repository browsing with thumbnails).
- [x] Data Binding logic processing variables like `{{homeTeam.name}}`.
- [x] Right Sidebar (Properties Editor & Layer Stack viewer).
- [x] Canvas with Drag-and-Drop capability for permitted elements.
- [x] Hot selection: clicking elements on the canvas activates them in the editor panel.
- [ ] Electron Integration (Main process setup, IPC channels).
- [ ] Local Database (SQLite + Drizzle integration for saving generated templates/matches).
- [ ] User Asset Manager (local image uploads via Electron `dialog`).

## Instructions for Claude (AI Assistant)

If you are reading this file to continue development, please keep the following guidelines in mind:

1. **Maintain the Interface Segregation:** `TemplateLayer` is strictly a structural parent container. `TemplateElement` is the rendered node. Keep these separate.
2. **Electron-First Features:** Since the goal is an Electron app, prioritize native file system solutions for saving images and SQLite for database needs. Do *not* build traditional REST API backends unless integrating.
3. **Canvas Performance:** `react-konva` handles many components. Avoid unnecessary re-renders in the main `EditorWorkspace` node. Store complex overrides safely.
4. **Styling Constraint:** Stick to Tailwind CSS and `cn()` logic matching the existing cyberpunk/dark-theme aesthetics (heavy use of zinc colors, cyan/yellow accents).
