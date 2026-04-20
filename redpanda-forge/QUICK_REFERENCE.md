# RedPanda Forge - Developer Quick Reference

## ⚡ Quick Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build           # Production build
npm run lint            # TypeScript check
npm run preview         # Preview production build
npm run clean           # Remove build artifacts

# Package management
npm install             # Install dependencies
npm update              # Update packages
npm audit               # Security audit
npm fund                # View funding info
```

---

## 📁 File Paths & Imports

### Path Aliases
```typescript
// Instead of:
import { cn } from '../../../lib/utils'

// Use:
import { cn } from '@/lib/utils'

// Mappings:
@/*           → src/*
@/components  → src/components
@/lib         → src/lib
@/types       → src/types
@/stores      → src/stores
```

---

## 🎨 Common Component Patterns

### Button
```tsx
import { Button } from '@/components/ui/button'

<Button variant="default" size="sm">Save</Button>
<Button variant="ghost" size="icon-sm"><Settings size={16} /></Button>

// Variants: default, destructive, outline, secondary, ghost, link
// Sizes: default, sm, lg, icon, icon-sm, icon-xs
```

### Select
```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

<Select value={value} onValueChange={setValue}>
  <SelectTrigger className="w-[200px]">
    <SelectValue placeholder="Choose..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="opt1">Option 1</SelectItem>
    <SelectItem value="opt2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Tabs
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

<Tabs defaultValue="data" className="w-full">
  <TabsList>
    <TabsTrigger value="data">Data</TabsTrigger>
    <TabsTrigger value="design">Design</TabsTrigger>
  </TabsList>
  <TabsContent value="data">Data content</TabsContent>
  <TabsContent value="design">Design content</TabsContent>
</Tabs>
```

### Input
```tsx
import { Input } from '@/components/ui/input'

<Input 
  type="text" 
  placeholder="Enter value..." 
  className="w-full"
/>
```

### Slider
```tsx
import { Slider } from '@/components/ui/slider'

<Slider
  min={0}
  max={100}
  step={1}
  value={value}
  onValueChange={setValue}
/>
```

---

## 📊 Zustand Store Usage

### Access Store State
```typescript
import { useEditorStore } from '@/stores/editorStore'

// Read state
const sessions = useEditorStore(state => state.sessions)
const activeSession = useEditorStore(state => 
  state.sessions.find(s => s.id === state.activeSessionId)
)

// Call actions
const setMatch = useEditorStore(state => state.setMatch)
const { undo, redo } = useEditorStore()
```

### Common Operations
```typescript
// Set match data
setMatch(activeSessionId, matchData)

// Set template
setTemplate(activeSessionId, templateData)

// Update element override
updateElementOverride(activeSessionId, elementId, { fill: '#FF0000' })

// Update manual input
updateManualInput(activeSessionId, elementId, 'newValue')

// Undo/Redo
undo()
redo()
canUndo() ? 'Can undo' : 'Cannot undo'
```

### Settings Store
```typescript
import { useSettingsStore } from '@/stores/settingsStore'

const theme = useSettingsStore(state => state.theme)
const applyTheme = useSettingsStore(state => state.applyTheme)

applyTheme('dark')  // Apply dark theme
```

---

## 🎯 Template & Data Types

### Template Structure
```typescript
interface Template {
  id: string
  name: string
  width: number
  height: number
  ratio: Ratio  // '16:9' | '9:16' | '1:1' | '4:3'
  sport: Sport  // 'football' | 'basketball' | 'tennis' | 'esports'
  layers: TemplateLayer[]
}

interface TemplateLayer {
  id: string
  name: string
  visible: boolean
  expanded: boolean
  elements: TemplateElement[]
}

interface TemplateElement {
  id: string
  type: 'text' | 'image' | 'shape'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  fill?: string          // Color for text/shapes
  fontSize?: number
  fontFamily?: string
  text?: string
  src?: string           // For images
  dataKey?: string       // e.g., 'homeTeam.name'
  draggable?: boolean
  editableProperties?: string[]
}
```

### Match Data
```typescript
interface Match {
  id: string
  sport: Sport
  league: string
  date: Date
  homeTeam: Team
  awayTeam: Team
  score?: { home: number; away: number }
  venue?: Venue
}

interface Team {
  id: string
  name: string
  shortName: string
  logo?: string
  colors?: { primary: string; secondary: string }
}
```

---

## 🔗 Data Binding Syntax

### Basic Examples
```
{{match.homeTeam.name}}          // Access nested properties
{{score.home}}                   // Get value
{{date | date:dd/MM/yyyy}}       // With pipe formatting
{{name | uppercase}}             // Chain transformations
{{count | number}}               // Format numbers as 1,234.00
```

### Common Pipes
```
| uppercase              // CONVERT TO UPPERCASE
| lowercase              // convert to lowercase
| titlecase              // Convert To Titlecase
| number                 // 1234 → 1,234.00
| boolean:Yes:No         // true → Yes, false → No
| date:dd/MM/yyyy        // Format date
| time:HH:mm             // Format time
| contrast               // Get contrasting color
| shorten:10             // Truncate with ellipsis
| prefix:Team:           // Team: {value}
| suffix: FC             // {value} FC
| replace:old:new        // Replace substring
| json                   // Pretty print JSON
```

---

## 🎨 Tailwind CSS Quick Refs

### Spacing
```
m-1, m-2, m-4, m-8       // Margin
p-1, p-2, p-4, p-8       // Padding
gap-1, gap-2, gap-4      // Gap between flex/grid items
```

### Sizing
```
w-full, w-1/2, w-1/3     // Width
h-screen, h-full         // Height
min-w-0, max-w-full      // Min/Max
```

### Colors
```
bg-app-bg                // Use theme variables
text-app-text
border-app-border
ring-app-accent
```

### Flexbox
```
flex items-center justify-between
gap-4 p-2
flex-1, flex-col, flex-wrap
```

### Grid
```
grid grid-cols-3 gap-4
col-span-2 row-span-1
```

### Responsive
```
md:w-1/2 lg:w-1/3        // Breakpoints: sm, md, lg, xl, 2xl
hidden md:block          // Show on medium+
```

---

## 🔍 Debugging Utilities

### Console Logging
```typescript
// Check store state
console.log(useEditorStore.getState())

// Watch for changes
useEditorStore.subscribe(
  state => console.log('Changed:', state)
)

// Debug data binding
console.log('Resolved:', resolveDataKey(match, 'homeTeam.name'))
```

### React DevTools
```
1. Install "React Developer Tools" extension
2. Open DevTools → Components tab
3. Inspect component props and hooks
4. Use Profiler to check re-renders
```

### Vite HMR
```typescript
// Check HMR status
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('Module updated')
  })
}
```

---

## 📝 Common Code Snippets

### Create New Component
```tsx
import React from 'react'
import { cn } from '@/lib/utils'

interface MyComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'alt'
}

export const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, variant = 'default', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'base-styles',
        variant === 'alt' && 'alt-styles',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
MyComponent.displayName = 'MyComponent'
```

### Add Store Action
```typescript
// In editorStore.ts
addSession: (sessionData) => set(state => ({
  sessions: [...state.sessions, sessionData],
  activeSessionId: sessionData.id
}))

// Usage
const addSession = useEditorStore(state => state.addSession)
addSession({ id: 'new-1', name: 'New Project', ... })
```

### Utility Function
```typescript
// src/lib/myUtils.ts
export function processData(input: string): string {
  return input.trim().toUpperCase()
}

// Usage
import { processData } from '@/lib/myUtils'
const result = processData(userInput)
```

### Conditional Styling
```tsx
<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  error && 'error-classes',
  variant === 'alt' && 'alt-classes'
)}>
  Content
</div>
```

---

## 🚨 Error Handling

### Safe Data Access
```typescript
// ❌ Risky
const name = match.homeTeam.name  // Can crash if undefined

// ✅ Safe
const name = match?.homeTeam?.name ?? 'Unknown'

// ✅ With type guard
if (match && 'homeTeam' in match) {
  const name = match.homeTeam.name
}
```

### Try-Catch
```typescript
try {
  const data = await fetchData()
  processData(data)
} catch (error) {
  console.error('Error:', error)
  showErrorMessage('Failed to load data')
}
```

### Validation
```typescript
function validateMatch(data: unknown): Match {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid match data')
  }
  
  if (!('id' in data) || !('sport' in data)) {
    throw new Error('Missing required fields')
  }
  
  return data as Match
}
```

---

## 🔄 Async Operations

### Data Fetching
```typescript
const [loading, setLoading] = React.useState(false)
const [error, setError] = React.useState<string | null>(null)
const [data, setData] = React.useState<DataType | null>(null)

React.useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await fetch('/api/data')
      const json = await result.json()
      setData(json)
    } catch (err) {
      setError('Failed to load')
    } finally {
      setLoading(false)
    }
  }
  
  fetchData()
}, [])

return loading ? 'Loading...' : error ? `Error: ${error}` : <div>{data}</div>
```

### Debounce Input
```typescript
import { useCallback, useRef } from 'react'

const handleChange = useCallback((value: string) => {
  clearTimeout(timeoutRef.current)
  timeoutRef.current = setTimeout(() => {
    processValue(value)
  }, 300) // Wait 300ms after typing stops
}, [])
```

---

## 🎯 Performance Tips

### Memoization
```typescript
// Prevent re-renders
const Component = React.memo(({ props }) => {
  return <div>{props}</div>
})

// Memoize expensive calculations
const expensive = useMemo(() => 
  calculateSomething(data),
  [data]
)

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething()
}, [dependency])
```

### Lazy Loading
```typescript
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

<Suspense fallback={<div>Loading...</div>}>
  <HeavyComponent />
</Suspense>
```

### Asset Caching
```typescript
const cache = new Map<string, ImageData>()

async function loadAsset(url: string) {
  if (cache.has(url)) return cache.get(url)
  const data = await fetch(url)
  cache.set(url, data)
  return data
}
```

---

## 🔧 Build & Deploy

### Environment Variables
```bash
# .env.local (local development)
GEMINI_API_KEY=your_key_here

# .env.production (production)
GEMINI_API_KEY=prod_key_here
```

### Build Output
```bash
npm run build
# Creates dist/ folder with:
# - dist/index.html
# - dist/assets/index-*.js
# - dist/assets/index-*.css
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel
# Follow prompts to connect GitHub repo
```

---

## 📚 Quick Links

- **Local Dev**: http://localhost:3000
- **GitHub**: https://github.com/r-e-dpanda/RedPanda-Forge
- **Docs**: See README.md, AGENTS.md, Claude.md
- **Assets**: Check `/public` folder structure

---

## ⚠️ Common Mistakes

| ❌ Don't | ✅ Do |
|---------|-------|
| `const data: any` | `const data: MatchData` |
| `match.team.name` | `match?.team?.name ?? 'N/A'` |
| `<div dangerouslySetInnerHTML>` | `<div>{text}</div>` |
| Copy styling logic | Use Tailwind classes |
| Mutate state directly | Use store actions |
| Console.log debugging | Use React DevTools |
| Hardcode values | Use constants/config |
| Ignore TypeScript errors | Fix type issues |

---

## 🆘 Get Help

```
TypeScript Error?
→ Check src/types/ for interfaces

Component Crash?
→ Add error boundaries: <ErrorBoundary>

Performance Issue?
→ Profile with React DevTools Profiler

Build Failed?
→ npm run clean && npm install && npm run build

Can't resolve import?
→ Check path aliases in vite.config.ts
```

---

**Last Updated**: April 20, 2026
**Version**: 1.0
