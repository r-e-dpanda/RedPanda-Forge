# RedPanda Forge

A desktop-class React application for generating high-quality sports graphics, matchday thumbnails, and social media assets. Combines a dynamic data-binding engine with a visual canvas editor.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Open http://localhost:3000
```

---

## 📚 Documentation

- **[docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)** — Setup, installation, first steps
- **[AGENTS.md](AGENTS.md)** — Canonical development guide, architecture, conventions ⭐ **START HERE**
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** — Cheat sheet, code snippets, commands
- **[ASSETS_STRUCTURE.md](ASSETS_STRUCTURE.md)** — Asset organization & resolution

---

## 🔧 Available Commands

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Production build
npm run lint     # TypeScript type checking
npm run preview  # Preview production build
npm run clean    # Clean dist folder
```

---

## 📊 Tech Stack

- **React 19** + Vite 6 + TypeScript 5.8
- **Tailwind CSS 4** + shadcn/ui
- **Konva 10** for canvas rendering
- **Zustand 5** for state management
- **Electron** integration ready

---

## 🎯 Key Features

✅ Multi-tab session editing with undo/redo  
✅ Data binding engine with pipes  
✅ Konva-based canvas with drag & drop  
✅ Responsive UI scaling  
✅ Dark/light themes  
✅ Internationalization (EN + VI)  
✅ Type-safe TypeScript throughout  

---

## 📁 Project Structure

```text
src/
├── components/        # React components
├── stores/           # Zustand state
├── lib/              # Business logic & utilities
├── types/            # TypeScript definitions
├── locales/          # i18n (en.ts, vi.ts)
├── constants/        # Themes, config
└── App.tsx           # Main component
```

---

## 🤝 Contributing

1. Read [AGENTS.md](AGENTS.md) for conventions
2. Follow TypeScript strict mode
3. Run `npm run lint` before committing
4. Keep documentation in sync

---

## 📄 License

See LICENSE file for details.

---

**Status**: ✅ Development ready | **Last Updated**: May 5, 2026
