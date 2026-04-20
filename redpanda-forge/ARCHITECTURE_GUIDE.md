# RedPanda Forge - Architecture & Development Guide

## 📐 System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     React App (Vite)                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           UI Layer (Components)                        │  │
│  │  ┌───────────────┬───────────────┬──────────────────┐  │  │
│  │  │  LeftSidebar  │  EditorArea   │   RightPanel     │  │  │
│  │  │ • Sport       │ • Canvas      │ • Properties     │  │  │
│  │  │ • Matches     │ • Konva       │ • Data Binding   │  │  │
│  │  │ • Templates   │ • Grid        │ • History        │  │  │
│  │  └───────────────┴───────────────┴──────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │        State Management (Zustand)                      │  │
│  │  ┌───────────────┬───────────────┬──────────────────┐  │  │
│  │  │ editorStore   │settingsStore  │    Local State   │  │  │
│  │  │ • sessions    │ • themes      │ • UI selections  │  │  │
│  │  │ • overrides   │ • prefs       │ • form values    │  │  │
│  │  │ • history     │               │                  │  │  │
│  │  └───────────────┴───────────────┴──────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         Template Engine & Data Binding                 │  │
│  │  ┌─────────── ───┬───────────────┬──────────────────┐  │  │
│  │  │ templateEngine│  colorUtils   │ formatters       │  │  │
│  │  │ • Pipes       │  • Contrast   │ • Date/Time      │  │  │
│  │  │ • Resolvers   │  • Colors     │ • Text           │  │  │
│  │  └───────────────┴───────────────┴──────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │            Data & Asset Management                     │  │
│  │  ┌───────────────┬───────────────┬──────────────────┐  │  │
│  │  │  mockData     │ assetManager  │templateRegistry  │  │  │
│  │  │ • Matches     │ • Images      │ • Templates      │  │  │
│  │  │ • Teams       │ • Logos       │ • Library        │  │  │
│  │  └───────────────┴───────────────┴──────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Data Storage (Future)                     │  │
│  │  • Electron: Local File System                         │  │
│  │  • Database: SQLite + Drizzle ORM                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```
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
    │  • formatters                │
    │  • transformations           │
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

## 🎯 Key Design Patterns

### 1. **Separation of Concerns**

```
Templates (JSON)          Match Data          Editor State
     ↓                        ↓                    ↓
  Default Props      Dynamic Values       User Overrides
     └────────────────────┬─────────────────────┘
                          ↓
                   Merged Final Value
                          ↓
                  Render on Canvas
```

**Why**: Preserves template integrity, allows full control without mutations

### 2. **Compound Components Pattern**

```tsx
// Select compound component
<Select value={value} onValueChange={handleChange}>
  <SelectTrigger>
    <SelectValue placeholder="Choose..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>

// Manages state via Context
// Flexible, composable, accessible
```

### 3. **Session-Based State Management**

```typescript
interface WorkflowSession {
  id: string
  name: string
  template: Template | null
  match: Match | null
  elementOverrides: Map<string, Partial<TemplateElement>>
  manualInputs: Map<string, string>
  history: SessionHistoryEntry[]
  historyIndex: number
}

// Benefits:
// - Multiple independent edits
// - Scoped undo/redo
// - Tab-like workflow
```

### 4. **Template Resolution Pipeline**

```typescript
// Resolve value with priority order
function resolveElementProperty(
  element: TemplateElement,
  property: string,
  overrides?: Partial<TemplateElement>,
  match?: Match
): any {
  // 1. User override (highest)
  if (overrides?.[property] !== undefined) {
    return overrides[property]
  }
  
  // 2. Data binding (if available)
  if (element.dataKey) {
    const boundValue = resolveDataKey(match, element.dataKey)
    if (boundValue !== undefined) return boundValue
  }
  
  // 3. Template default (lowest)
  return element[property]
}
```

---

## 📁 Module Organization

### `src/types/` - Type Definitions
```typescript
// template.ts
Template          // Root container (width, height, ratio, sport)
TemplateLayer     // Organizational group (visible, expanded)
TemplateElement   // Rendered object (text, image, shape)
ElementProperty   // Individual property (position, style, etc)

// asset.ts
AssetReference    // Image/logo reference
AssetMetadata     // Asset metadata (size, format, etc)

// settings.ts
AppSettings       // User preferences
ThemeDefinition   // Theme colors and variables
```

### `src/stores/` - State Management
```typescript
// editorStore.ts (Zustand)
- sessions[]              // Array of editing sessions
- activeSessionId         // Currently active session
- setMatch()              // Set match in active session
- setTemplate()           // Set template in active session
- updateElementOverride() // Update element properties
- undo() / redo()         // History operations

// settingsStore.ts (Zustand)
- theme                   // Current theme (dark, light, etc)
- settings                // User preferences
- applyTheme()            // Apply theme to DOM
```

### `src/lib/` - Business Logic
```typescript
// templateEngine.ts
- resolveDataKey()        // Navigate match data with dot notation
- applyPipes()            // Apply transformers (uppercase, date, etc)
- parseTemplateString()   // Parse {{binding}} syntax

// colorUtils.ts
- getContrast()           // Get contrasting color (white/black)
- hexToRgb()              // Color conversion
- adjustBrightness()      // Color manipulation

// formatters.ts
- formatNumber()          // 1234.56 → "1,234.56"
- formatDate()            // Date formatting
- formatText()            // Text transformation

// assetManager.ts
- loadImage()             // Load image from public/
- cacheAsset()            // Cache for performance
- getAssetPath()          // Construct asset path

// mockData.ts
- MOCK_MATCHES            // Sample match data
- MOCK_TEMPLATES          // Sample templates
```

### `src/components/` - UI Components
```
components/
├── ui/                    # Base UI elements
│   ├── button.tsx         # Sized variants
│   ├── select.tsx         # Compound select
│   ├── tabs.tsx           # Tab component
│   ├── slider.tsx         # Range input
│   ├── input.tsx          # Text input
│   ├── checkbox.tsx       # Checkbox
│   ├── separator.tsx      # Divider
│   └── switch.tsx         # Toggle
│
├── Editor/                # Main editor
│   └── EditorWorkspace.tsx # Canvas + controls
│
├── editor/                # Editor utilities
│   └── KonvaEditor.tsx    # Konva stage component
│
├── panels/                # Side panels
│   └── RightPanel.tsx     # Properties & data
│
├── settings/              # Settings modal
│   └── SettingsModal.tsx
│
├── LeftSidebar.tsx        # Match & template selection
└── PasteTemplateModal.tsx # Template import dialog
```

---

## 🔌 Integration Points

### Adding a New Feature

1. **Define Types** (`src/types/`)
```typescript
interface MyFeature {
  id: string
  name: string
  // ... properties
}
```

2. **Extend State** (`src/stores/editorStore.ts`)
```typescript
interface WorkflowSession {
  // ... existing
  myFeature?: MyFeature
}
```

3. **Create Utilities** (`src/lib/`)
```typescript
export function processMyFeature(data: MyFeature): ProcessedData {
  // Logic here
}
```

4. **Build UI** (`src/components/`)
```tsx
export const MyFeatureComponent = ({ feature }) => {
  // React component
}
```

5. **Connect Store** (`src/components/...`)
```tsx
const feature = useEditorStore(state => state.activeSession?.myFeature)
const updateFeature = useEditorStore(state => state.updateFeature)
```

---

## 🎨 Styling Architecture

### CSS Variables (Theme System)

```css
/* src/index.css */
:root {
  /* Light/Dark modes */
  --app-bg: #0a0b0d;              /* Background */
  --app-sidebar: #131518;         /* Sidebar background */
  --app-card: #1a1d22;            /* Card background */
  --app-text: #ffffff;            /* Text color */
  --app-muted: #888888;           /* Muted text */
  --app-accent: #00d9ff;          /* Accent color */
  --app-border: #2a2d33;          /* Border color */
  
  /* Tailwind aliases */
  --foreground: var(--app-text);
  --background: var(--app-bg);
  --border: var(--app-border);
}
```

### Component Styling

```tsx
// Use app-* classes for consistency
<div className="bg-app-bg text-app-text border-app-border">
  Content
</div>

// Or cn() utility for dynamic classes
import { cn } from '@/lib/utils'

<div className={cn(
  'bg-app-card p-4 rounded-lg',
  isActive && 'ring-2 ring-app-accent'
)}>
  Content
</div>
```

### Theme Switching

```typescript
// src/lib/themeUtils.ts
export function applyTheme(themeName: 'dark' | 'light' | 'custom') {
  const theme = themes[themeName]
  
  // Inject CSS variables
  Object.entries(theme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--app-${key}`, value)
  })
  
  // Update dark mode class for shadcn/ui
  if (themeName === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}
```

---

## 🧪 Testing Guidelines

### Unit Tests (Utilities)
```typescript
// src/lib/__tests__/templateEngine.test.ts
describe('resolveDataKey', () => {
  it('should resolve dot notation', () => {
    const data = { homeTeam: { name: 'City' } }
    expect(resolveDataKey(data, 'homeTeam.name')).toBe('City')
  })
})
```

### Component Tests
```typescript
// src/components/__tests__/Button.test.tsx
describe('Button', () => {
  it('renders with correct variant', () => {
    const { container } = render(<Button variant="ghost">Test</Button>)
    expect(container.querySelector('[class*="hover:"]')).toBeTruthy()
  })
})
```

---

## 🚀 Performance Optimization

### Canvas Performance
```typescript
// Use React.memo for expensive components
const KonvaEditor = React.memo(({ stage, ...props }) => {
  // Prevents re-render if props unchanged
})

// Memoize expensive calculations
const memoizedScale = useMemo(() => 
  calculateScale(canvasWidth, templateWidth),
  [canvasWidth, templateWidth]
)
```

### Asset Loading
```typescript
// Cache assets to prevent re-fetching
const assetCache = new Map<string, HTMLImageElement>()

async function loadAsset(path: string) {
  if (assetCache.has(path)) {
    return assetCache.get(path)
  }
  
  const img = await fetchImage(path)
  assetCache.set(path, img)
  return img
}
```

### Bundle Size
```typescript
// Use dynamic imports for heavy modules
const PasteModal = lazy(() => import('./PasteTemplateModal'))

<Suspense fallback={<div>Loading...</div>}>
  <PasteModal />
</Suspense>
```

---

## 🔐 Security Considerations

### Data Validation
```typescript
// Always validate external data
function validateTemplate(data: unknown): Template {
  if (!isValidTemplate(data)) {
    throw new Error('Invalid template structure')
  }
  return data as Template
}
```

### XSS Prevention
```typescript
// Never inject raw HTML
❌ <div dangerouslySetInnerHTML={{ __html: userInput }} />

✅ <div>{userInput}</div> // React escapes by default
```

### File Upload Safety
```typescript
// Validate file types and sizes
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

function validateFile(file: File): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large')
  }
  
  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type')
  }
}
```

---

## 📋 Code Quality Standards

### ESLint Configuration
```javascript
// .eslintrc.js (to implement)
module.exports = {
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  rules: {
    'react/react-in-jsx-scope': 'off', // React 17+
    'no-unused-vars': 'warn'
  }
}
```

### Prettier Configuration
```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### TypeScript Best Practices
```typescript
// ✅ Use strict null checks
"strictNullChecks": true

// ✅ Define explicit types
const activeSession: WorkflowSession | null = sessions[0]

// ✅ Avoid `any`
❌ const data: any = fetchData()
✅ const data: FetchResult = fetchData()

// ✅ Use const assertions for literals
const themes = as const {
  dark: 'dark',
  light: 'light'
}
```

---

## 🔄 Version Control Best Practices

### Commit Messages
```
feat: Add template import dialog
fix: Resolve canvas scaling on mobile
docs: Update architecture guide
refactor: Simplify color utility functions
perf: Optimize asset loading with caching
```

### Branch Naming
```
feature/add-electron-support
bugfix/canvas-drag-performance
docs/update-architecture-guide
```

---

## 📚 Common Development Tasks

### Add a New Sport
```typescript
// 1. Update types/template.ts
type Sport = 'football' | 'basketball' | 'tennis' | 'esports' | 'cricket'

// 2. Add to mockData.ts
const MOCK_MATCHES = [
  // ... existing
  { id: 'cricket-1', sport: 'cricket', ... }
]

// 3. Add team logos to public/cricket/[league]/

// 4. Create templates for sport
```

### Extend Template Binding
```typescript
// 1. Add to templateEngine.ts applyPipes()
case 'myPipe':
  return performTransformation(value)

// 2. Use in template
{{match.date | myPipe}}
```

### Add Settings Option
```typescript
// 1. Update types/settings.ts
interface AppSettings {
  // ... existing
  myOption: boolean
}

// 2. Update settingsStore.ts
const useSettingsStore = create(store => ({
  settings: { myOption: false },
  updateSetting: (key, value) => { ... }
}))

// 3. Add UI in SettingsModal.tsx
```

---

## 🐛 Debugging Tips

### Debug Zustand State
```typescript
// Log state changes
useEditorStore.subscribe(
  (state) => console.log('Store changed:', state)
)
```

### Debug Data Binding
```typescript
// Add temporary log in templateEngine
console.log('Resolving:', dataKey, 'from:', match)
```

### React DevTools
```
1. Install React DevTools browser extension
2. Use Profiler tab to track renders
3. Use Components tab to inspect props/state
```

### Vite Debug
```bash
# Source maps enabled in dev
npm run dev

# Check network tab for source maps
# Use browser DevTools to set breakpoints
```

---

## 📞 Getting Help

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Canvas not updating | Check override logic in store |
| Theme not applying | Verify CSS variable injection |
| Image not loading | Check asset path in public/ |
| Undo/Redo broken | Inspect history stack |
| Performance lag | Profile with React DevTools |

### Documentation References
- **AGENTS.md**: Detailed conventions
- **Claude.md**: Architecture overview
- **ASSETS_STRUCTURE.md**: Asset organization
- **README.md**: Quick start

---

**Last Updated**: April 20, 2026
**Status**: ✅ Complete Architecture Documentation
