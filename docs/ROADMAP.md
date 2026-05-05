# RedPanda Forge - Roadmap

**Date**: May 5, 2026  
**Status**: 🚀 **IN ACTIVE DEVELOPMENT**

---

## 📊 Overview

RedPanda Forge is a React-based sports graphics editor with a modern UI, powerful template engine, and multi-session editing support. This roadmap outlines the strategic direction and upcoming milestones for the project.

---

## 🎯 Strategic Milestones

### Phase 1: Core Web Application (Completed ✅)

- React 19 + Vite 6 integration
- Advanced template binding engine
- Konva-based visual canvas
- Multi-session editor state (Zustand)
- Localization support (EN + VI)
- Responsive UI scaling

### Phase 2: Desktop Integration (In Progress ⏳)

- **Electron Integration**: Implement main process and preload scripts for native desktop capabilities.
- **IPC Handlers**: Secure communication between React frontend and Electron backend.
- **Local File System**: Direct reading and writing of assets and templates from the local machine.

### Phase 3: Data & Persistence (Upcoming 📅)

- **Local Database**: Integrate SQLite + Drizzle for robust local storage.
- **User Asset Manager**: UI to organize user-provided assets, logos, and custom templates.
- **Persistent Sessions**: Save and resume workflow sessions between app restarts.

### Phase 4: Advanced Features (Future 🔮)

- **Export Engine**: High-resolution rendering and export of templates to PNG/JPG/WebP.
- **Template Marketplace**: A centralized hub for discovering and sharing community templates.
- **Cloud Sync**: Optional cloud syncing for settings and lightweight templates.
- **Real-time Collaboration**: Multi-user editing capabilities for enterprise usage.

---

## 🐛 Known Issues / Technical Debt

- Code-splitting optimization: Main bundle could be optimized for size.
- Ensure strict separation of TemplateLayer and TemplateElement across new features.
- Expand unit test coverage for the template binding engine.

---

**Last Updated**: May 5, 2026
