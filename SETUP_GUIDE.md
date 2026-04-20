# RedPanda Forge - Complete Setup Guide

## 📋 Project Overview

**RedPanda Forge** is a desktop-class React application (being migrated to Electron) designed to generate high-quality sports graphics, matchday thumbnails, and social media assets. It combines a dynamic data-binding engine with a visual canvas editor.

**Repository**: https://github.com/r-e-dpanda/RedPanda-Forge

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16+ (recommended: v18 or v20)
- **npm** v8+ or **yarn**
- **Git**

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/r-e-dpanda/RedPanda-Forge.git
cd RedPanda-Forge

# 2. Install dependencies
npm install

# 3. Create environment configuration
cp .env.example .env.local

# 4. Set your Gemini API Key (optional, for AI features)
# Edit .env.local and add your GEMINI_API_KEY

# 5. Start development server
npm run dev
```

The application will be available at: **http://localhost:3000**

---

## 📦 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload (port 3000) |
| `npm run build` | Build production bundle in `/dist` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | TypeScript type checking |
| `npm run clean` | Remove build artifacts |

---

## 🏗️ Project Structure

```
RedPanda-Forge/
├── src/
│   ├── components/
│   │   ├── ui/                    # UI components (Button, Select, Tabs, etc)
│   │   ├── Editor/                # Main editor workspace
│   │   ├── panels/                # Right panel (properties, layers)
│   │   ├── settings/              # Settings modal
│   │   ├── LeftSidebar.tsx        # Match & template selection
│   │   └── PasteTemplateModal.tsx
│   │
│   ├── stores/
│   │   ├── editorStore.ts         # Zustand state (sessions, overrides)
│   │   └── settingsStore.ts       # Theme, user preferences
│   │
│   ├── types/
│   │   ├── template.ts            # Template, Layer, Element types
│   │   ├── asset.ts               # Asset management types
│   │   └── settings.ts            # Settings types
│   │
│   ├── lib/
│   │   ├── templateEngine.ts      # Data binding & pipes
│   │   ├── mockData.ts            # Mock matches & templates
│   │   ├── themeUtils.ts          # Theme application
│   │   ├── colorUtils.ts          # Color contrast, manipulation
│   │   ├── formatters.ts          # Text formatting utilities
│   │   ├── assetManager.ts        # Asset loading & caching
│   │   ├── templateRegistry.ts    # Template repository
│   │   └── utils.ts               # General utilities (cn, etc)
│   │
│   ├── constants/
│   │   └── themes.json            # Theme definitions
│   │
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles + theme CSS vars
│
├── public/
│   ├── templates/                 # Template images
│   └── [sport]/[league]/          # Team logos & assets
│
├── dist/                          # Production build output (generated)
├── node_modules/                  # Dependencies (generated)
├── package.json                   # Dependencies & scripts
├── vite.config.ts                 # Vite build configuration
├── tsconfig.json                  # TypeScript configuration
├── components.json                # shadcn/ui configuration
├── index.html                     # HTML entry point
│
├── AGENTS.md                      # Developer guidelines & conventions
├── Claude.md                      # Architecture documentation
├── ASSETS_STRUCTURE.md            # Asset organization
├── README.md                      # Project README
└── .env.example                   # Environment variables template
```

---

## 🔧 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | React 19 + Vite 6 |
| **Language** | TypeScript 5.8 |
| **Styling** | Tailwind CSS 4 + custom themes |
| **Canvas Rendering** | Konva 10 + react-konva + use-image |
| **State Management** | Zustand 5 (multi-session editor state) |
| **UI Components** | @base-ui/react + shadcn/ui hybrid |
| **Icons** | Lucide React |
| **Data Binding** | Custom template engine with pipe operators |
| **Build Tool** | Vite with React plugin |

---

## 📊 Core Concepts

### 1. **Template System**
Templates define the canvas structure with:
- **Template**: Root container (width, height, ratio, sport)
- **TemplateLayer**: Organizational groups (folders for visual elements)
- **TemplateElement**: Renderable objects (Text, Image, Shape)

Each element has:
- Positioning: `x`, `y`, `width`, `height`
- Styling: `fill`, `fontFamily`, `fontSize`, `opacity`
- Interaction: `draggable`, `editableProperties`
- Data Binding: `dataKey` (e.g., `homeTeam.name`)

### 2. **Data Binding Engine**
Resolves values in this order:
1. **Template Base**: Default properties defined in template JSON
2. **Data Binding**: Dynamic values from match object using `{{dot.notation}}`
3. **User Overrides**: Manual edits in the Editor Panel (highest priority)

### 3. **State Management (Zustand)**
`editorStore.ts` manages:
- **WorkflowSessions**: Tabs representing different edits
  - Each session has: `id`, `name`, `template`, `match`
  - `elementOverrides`: Map of user-modified properties
  - `manualInputs`: Values for unresolved data bindings
  - `history`: Undo/Redo stack (scoped per session)

### 4. **Themes**
Three built-in themes in `src/constants/themes.json`:
- **Dark (Iron & Sulfur)**: Default industrial dark theme
- **Icy Mint (Aqua Light)**: Modern light theme with teal accents
- **Studio Light**: Minimal editorial light theme

Themes inject CSS variables (e.g., `--app-bg`, `--app-text`) that components use.

---

## 🎨 Template Binding Syntax

Templates use a templating language for dynamic content:

### Basic Syntax
```
{{match.homeTeam.name}}           # Dot notation data access
{{homeTeam.name | uppercase}}     # With pipe transformations
```

### Supported Pipes
| Pipe | Example | Result |
|------|---------|--------|
| `uppercase` | `{{name \| uppercase}}` | TEAM NAME |
| `lowercase` | `{{name \| lowercase}}` | team name |
| `titlecase` | `{{name \| titlecase}}` | Team Name |
| `number` | `{{1234 \| number}}` | 1,234.00 |
| `boolean:Yes:No` | `{{isActive \| boolean:Yes:No}}` | Yes/No |
| `date:format` | `{{date \| date:dd/MM/yyyy}}` | 25/12/2024 |
| `time:format` | `{{time \| time:HH:mm}}` | 15:30 |
| `contrast` | `{{color \| contrast}}` | White or Black |
| `shorten:len` | `{{text \| shorten:10}}` | Long te... |
| `prefix:str` | `{{name \| prefix:Team: }}` | Team: Name |
| `suffix:str` | `{{name \| suffix: FC}}` | Name FC |
| `replace:old:new` | `{{text \| replace:a:b}}` | text with replacements |
| `json` | `{{data \| json}}` | Pretty-printed JSON |

---

## 🎯 UI/UX Features

### Left Sidebar
- **Sport Selector**: Switch between football, basketball, tennis, esports
- **Match List**: Browse available matches for the selected sport
- **Template Repository**: Browse templates by ratio and sport
- **Match Details**: View match information in sidebar

### Canvas Editor (Center)
- **Interactive Konva Canvas**: Render templates with real-time binding
- **Drag & Drop**: Move elements (if `draggable: true`)
- **Element Selection**: Click elements to select them
- **Zoom & Pan**: Scale canvas to fit viewport
- **Guides**: Visual alignment helpers (optional)

### Right Panel
Two tabs:
1. **Data Tab**: Shows match data source and binding overview
2. **Design Tab**: Property controls for selected element
   - Position/Size sliders
   - Color pickers
   - Text inputs
   - Font family/size selectors
   - Source vs. Value distinction
   - Reset button for overrides

### Top Tab Bar
- **Session Tabs**: Manage multiple open edits
- **New Session**: Create new editing session
- **Close Tab**: Close with dirty-check confirmation
- **Undo/Redo**: Per-session history
- **Export**: Download/save graphics

---

## 🛠️ Development Workflow

### Adding a New Component

1. Create component file in `src/components/`
```tsx
import React from 'react'
import { cn } from '@/lib/utils'

export const MyComponent = ({ className, ...props }) => (
  <div className={cn('base-classes', className)} {...props}>
    Content
  </div>
)
```

2. Import and use in parent components:
```tsx
import { MyComponent } from '@/components/MyComponent'
```

### Adding Template Binding Pipes

1. Edit `src/lib/templateEngine.ts`
2. Add pipe handler in `applyPipes()` function:
```typescript
case 'myPipe':
  return value.toUpperCase() // Your logic
```

3. Test with template:
```
{{text | myPipe}}
```

### Modifying Styles

Use Tailwind CSS classes with `app-` prefix for theme consistency:
```tsx
<div className="bg-app-bg text-app-text border-app-border">
  Content
</div>
```

Available theme variables:
- `bg-app-bg`, `bg-app-sidebar`, `bg-app-card`
- `text-app-text`, `text-app-muted`
- `border-app-border`, `ring-app-accent`

---

## 🔐 Environment Variables

Create `.env.local` with:

```env
# Gemini API Key (for AI-powered features)
GEMINI_API_KEY="your_gemini_api_key_here"

# App URL (for deployment)
APP_URL="http://localhost:3000"
```

**Note**: AI Studio automatically injects these at runtime. For local development, you can set them manually.

---

## 📦 Build & Deployment

### Production Build
```bash
npm run build
```

Output: `/dist` directory

### Preview Production Build
```bash
npm run preview
```

### Deployment Options

1. **Vercel** (recommended for React apps)
```bash
npm i -g vercel
vercel
```

2. **Netlify**
```bash
npm run build
# Deploy dist/ folder
```

3. **Docker**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["npm", "run", "preview"]
```

4. **Electron** (desktop app)
```bash
# WIP: Electron setup in progress
# Will enable offline usage and native file system access
```

---

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
# Change port in vite.config.ts or use:
npm run dev -- --port 3001
```

### TypeScript Errors
```bash
npm run lint
# Check for type issues and fix them
```

### Node Modules Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Fails
```bash
# Clean build
npm run clean
npm run build
```

### Hot Reload Not Working
Check if `DISABLE_HMR=false` in environment. Edit `vite.config.ts`:
```typescript
hmr: process.env.DISABLE_HMR !== 'true'
```

---

## 📚 Additional Resources

### Documentation Files in Project
- **AGENTS.md**: Detailed developer guidelines, conventions, and architecture
- **Claude.md**: Technical architecture overview
- **ASSETS_STRUCTURE.md**: How assets are organized and loaded
- **README.md**: Quick start and overview

### External Resources
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Konva Canvas](https://konvajs.org)
- [Zustand](https://github.com/pmndrs/zustand)
- [Vite Guide](https://vitejs.dev)

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Node.js v16+ installed: `node --version`
- [ ] npm v8+ installed: `npm --version`
- [ ] Dependencies installed: `npm install` completed
- [ ] Environment file created: `.env.local` exists
- [ ] TypeScript checks pass: `npm run lint`
- [ ] Development server starts: `npm run dev`
- [ ] Browser opens to http://localhost:3000
- [ ] Can load matches and templates
- [ ] Can drag elements on canvas
- [ ] Can edit properties in right panel
- [ ] Production build succeeds: `npm run build`

---

## 🤝 Contributing

When contributing, follow these principles (from AGENTS.md):
1. **Maintain Interface Segregation**: Keep `TemplateLayer` (structure) separate from `TemplateElement` (rendered)
2. **Electron-First**: Prioritize native file system and SQLite solutions
3. **Canvas Performance**: Avoid unnecessary re-renders in `EditorWorkspace`
4. **Styling Consistency**: Use Tailwind + dark theme aesthetics

---

## 📝 Fixed Issues

✅ All TypeScript compilation errors resolved:
- Added missing UI components: `Button`, `Select`, `Tabs`, `Separator`, `Slider`
- Created hybrid `@base-ui/react` + `shadcn/ui` component implementations
- Fixed type definitions for compound components
- Verified production build successful

---

## 🚀 Next Steps

1. **Start dev server**: `npm run dev`
2. **Explore the UI**: Navigate matches, templates, and canvas
3. **Review AGENTS.md**: Understand architecture and conventions
4. **Create custom template**: Add your own sports graphics template
5. **Extend functionality**: Add pipes, components, or features as needed

---

**Last Updated**: April 20, 2026
**Status**: ✅ Fully Functional & Ready for Development
