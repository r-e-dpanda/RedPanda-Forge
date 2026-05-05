# RedPanda Forge - Contribution & Workflow Guide

## 📋 Branch Naming Convention

```text
{type}/{feature-name}
```

| Type | Purpose | Example |
| ------ | --------- | --------- |
| `feature/` | New feature | `feature/add-electron-support` |
| `bugfix/` | Bug fix | `bugfix/canvas-scaling-issue` |
| `refactor/` | Code restructuring | `refactor/template-engine` |
| `docs/` | Documentation | `docs/update-architecture` |
| `perf/` | Performance improvement | `perf/optimize-asset-loading` |
| `chore/` | Dependencies, config | `chore/update-dependencies` |
| `test/` | Add tests | `test/add-canvas-tests` |

## 💬 Commit Message Format

```text
{type}: {subject}
```

- **Types**: `feat`, `fix`, `refactor`, `docs`, `style`, `perf`, `test`, `chore`, `ci`
- Use imperative mood ("add" not "added")
- Limit to 50 characters

Example: `feat: add electron main process with IPC channels`

## 📤 Pull Request Process

### Pre-commit Checklist

Before submitting a PR, ensure:

- `npm run lint` passes without errors.
- `npm run build` succeeds.
- Code aligns strictly with rules in **[AGENTS.md](../AGENTS.md)**.
- Separation of concerns between `TemplateLayer` and `TemplateElement` is maintained.
- CSS uses Tailwind `app-*` theme variables instead of hardcoded hex values.

### PR Requirements

- Write a descriptive title following the commit message format.
- List related issues (e.g., "Closes #42").
- Include screenshots if UI changes were made.

---

**Last Updated**: May 5, 2026
