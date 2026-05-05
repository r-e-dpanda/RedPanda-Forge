# RedPanda Forge - Complete Setup Guide

## 📋 Project Overview

**RedPanda Forge** is a desktop-class React application (being migrated to Electron) designed to generate high-quality sports graphics, matchday thumbnails, and social media assets. It combines a dynamic data-binding engine with a visual canvas editor.

**Repository**: <https://github.com/r-e-dpanda/RedPanda-Forge>

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

The application will be available at: **<http://localhost:3000>**

## 📖 Architecture & Conventions

For an in-depth understanding of **Core Concepts** (Template System, Data Binding Engine, Store Management), **Themes**, and the **Template Binding Syntax** (Pipes, formatters), please refer to the canonical development guide:

👉 **[AGENTS.md](AGENTS.md)**

It is critical that you review `AGENTS.md` before making any code contributions.

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

1. **Netlify**

```bash
npm run build
# Deploy dist/ folder
```

1. **Docker**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["npm", "run", "preview"]
```

1. **Electron** (desktop app)

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
- [ ] Browser opens to <http://localhost:3000>
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

## 🚀 Next Steps

1. **Start dev server**: `npm run dev`
2. **Explore the UI**: Navigate matches, templates, and canvas
3. **Review AGENTS.md**: Understand architecture and conventions
4. **Create custom template**: Add your own sports graphics template
5. **Extend functionality**: Add pipes, components, or features as needed

---

**Last Updated**: May 5, 2026
**Status**: ✅ Fully Functional & Ready for Development
