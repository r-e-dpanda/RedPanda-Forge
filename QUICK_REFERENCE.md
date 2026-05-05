# RedPanda Forge - Developer Quick Reference

## ⚡ Quick Commands

```bash
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm run lint             # TypeScript check
```

---

## 📁 File Paths & Imports

```typescript
import { cn } from '@/lib/utils' // Maps to src/lib/utils
import { useEditorStore } from '@/stores/editorStore'
```

---

## 📊 Zustand Store Usage

### Access Store State

```typescript
import { useEditorStore } from '@/stores/editorStore'

// Read state
const activeSession = useEditorStore(state => 
  state.sessions.find(s => s.id === state.activeSessionId)
)

// Call actions
const { setMatch, undo, redo, updateElementOverride } = useEditorStore.getState()
```

---

## 🎯 Template & Data Types

### Template Structure

```typescript
interface Template {
  id: string
  width: number
  height: number
  ratio: Ratio  // '16:9' | '9:16' | '1:1' | '4:3'
  sport: Sport  // 'football' | 'basketball' | 'tennis' | 'esports'
  layers: TemplateLayer[]
}

interface TemplateLayer {
  id: string
  visible: boolean
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
  text?: string
  src?: string           // For images
  dataKey?: string       // e.g., 'homeTeam.name'
}
```

### Match Data

```typescript
interface Match {
  id: string
  sport: Sport
  homeTeam: Team
  awayTeam: Team
  score?: { home: number; away: number }
}

interface Team {
  id: string
  name: string
  shortName: string
  colors?: { primary: string; secondary: string }
}
```

---

## 🔗 Data Binding Syntax

```text
{{match.homeTeam.name}}          // Access nested properties
{{score.home}}                   // Get value
```

### Supported Pipes

```text
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

**Last Updated**: May 5, 2026
