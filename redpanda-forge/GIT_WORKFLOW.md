# Git Workflow & Team Collaboration Guide

## 🔄 Git Workflow for RedPanda Forge

This guide establishes best practices for collaborating on RedPanda Forge.

---

## 📋 Branch Naming Convention

### Format
```
{type}/{feature-name}
```

### Types
| Type | Purpose | Example |
|------|---------|---------|
| `feature/` | New feature | `feature/add-electron-support` |
| `bugfix/` | Bug fix | `bugfix/canvas-scaling-issue` |
| `refactor/` | Code restructuring | `refactor/template-engine` |
| `docs/` | Documentation | `docs/update-architecture` |
| `perf/` | Performance improvement | `perf/optimize-asset-loading` |
| `chore/` | Dependencies, config | `chore/update-dependencies` |
| `test/` | Add tests | `test/add-canvas-tests` |

### Examples
```
feature/sports-graphics-export
bugfix/konva-drag-performance
refactor/zustand-store
docs/add-electron-guide
perf/image-caching
chore/update-vite-config
test/template-engine-unit
```

---

## 💬 Commit Message Format

### Format
```
{type}: {subject}

{body}

{footer}
```

### Types
```
feat:     New feature
fix:      Bug fix
refactor: Code restructuring
docs:     Documentation changes
style:    Code style changes
perf:     Performance improvements
test:     Test additions
chore:    Build config, dependencies
ci:       CI/CD configuration
```

### Subject Line
- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period at end
- Limit to 50 characters

### Examples
```
feat: add template import from JSON
fix: resolve canvas scaling on zoom
refactor: simplify color utility functions
docs: update setup guide for windows
perf: implement asset caching system
chore: upgrade tailwind to 4.1.14
test: add template engine unit tests
```

### Detailed Example
```
feat: add electron main process with IPC channels

- Implement main process with preload script
- Create IPC handlers for file system operations
- Add context isolation for security

Closes #42
Breaks: Legacy file format compatibility (migration guide added)
```

---

## 🔀 Branching Strategy

### Main Branches
```
main                    Production-ready code
  ↓
develop                 Integration/staging branch
  ↓
feature/*               Feature branches
bugfix/*                Bug fix branches
refactor/*              Refactoring branches
```

### Workflow

```
1. Create Feature Branch
   git checkout -b feature/my-feature develop

2. Work on Your Feature
   git add .
   git commit -m "feat: add feature x"

3. Keep Updated
   git fetch origin
   git rebase origin/develop

4. Push to Remote
   git push origin feature/my-feature

5. Create Pull Request
   GitHub: Compare & Pull Request

6. Code Review
   Team reviews, requests changes

7. Merge to Develop
   Squash commits for clean history

8. Merge to Main
   When ready for release
```

---

## 📤 Pull Request Process

### Before Creating PR
```bash
# Update from develop
git checkout develop
git pull origin develop

# Rebase your branch
git rebase develop

# Resolve conflicts if any
# Test your code
npm run lint
npm run build

# Push
git push origin feature/my-feature -f
```

### PR Title Format
```
{type}: {description}

Examples:
feat: add template import dialog
fix: resolve canvas drag performance
refactor: simplify editor store
docs: add electron setup guide
```

### PR Description Template
```markdown
## Description
Brief explanation of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing Done
Describe how you tested this

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed own code
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
```

### Code Review Checklist

**As Reviewer**:
- [ ] Code follows conventions (AGENTS.md)
- [ ] TypeScript types are correct
- [ ] No security vulnerabilities
- [ ] Performance is acceptable
- [ ] Tests are adequate
- [ ] Documentation is clear
- [ ] Commit messages are descriptive

**As Author**:
- [ ] Respond to all feedback
- [ ] Don't be defensive
- [ ] Ask questions if unclear
- [ ] Thank reviewers
- [ ] Mark as ready when done

---

## 🔗 Commit Best Practices

### Good Commits
```
✅ One logical change per commit
✅ Meaningful commit message
✅ Can be built in isolation
✅ Passes all tests
✅ Small and focused
```

### Bad Commits
```
❌ "update code"
❌ "fix stuff"
❌ "work in progress"
❌ Mixed concerns
❌ Too large
```

### Atomic Commits
```
Good:
  commit 1: refactor: simplify data binding logic
  commit 2: feat: add contrast pipe
  commit 3: test: add unit tests for pipes

Bad:
  commit 1: refactor and add feature and update tests
```

### Commit Tips
```bash
# Stage changes interactively
git add -p

# Amend last commit
git commit --amend

# Reword commit message
git rebase -i HEAD~3

# View commit before pushing
git log --oneline origin/develop..HEAD
```

---

## 🚨 Conflict Resolution

### When Conflicts Occur
```bash
# Pull latest
git fetch origin
git rebase origin/develop

# Resolve conflicts in editor
# Look for:
# <<<<<<<< HEAD
# Your changes
# ========
# Their changes
# >>>>>>>>

# Fix conflicts
git add .
git rebase --continue

# Or abort if needed
git rebase --abort
```

### Conflict Prevention
```bash
# Always pull before starting work
git pull origin develop

# Update frequently
git fetch origin
git rebase origin/develop

# Push regularly
git push origin feature/my-feature

# Don't edit main directly
# Always use feature branches
```

---

## 📝 Code Review Comments

### When Requesting Changes
```
❌ "This is wrong"
✅ "This implementation could cause issues because...
   Consider using X instead, which handles Y case."

❌ "Bad code"
✅ "For readability, could we extract this to a function?
   It would also make testing easier."
```

### Providing Feedback
```
# Style Issue
'nit: Consider using const instead of let here'

# Design Issue
'question: Why not use the existing resolveValue function?'

# Potential Bug
'warning: This could fail if data is undefined'

# Good Solution
'suggestion: Could use useMemo for performance'

# Approval
'looks good! Minor: variable naming'
```

---

## 🔀 Merging Strategy

### Squash Merge (Recommended)
```bash
# Combines all feature commits into one
git merge --squash feature/my-feature

# Results in clean history
```

**When to use**: Feature branches with multiple commits

### Regular Merge
```bash
# Preserves full history
git merge feature/my-feature

# Shows feature branch in history
```

**When to use**: Long-lived branches with meaningful commits

### Rebase Merge
```bash
# Replays commits on top of base
git rebase develop
git merge --ff-only

# Linear history
```

**When to use**: Linear, clean history preferred

---

## 🏷️ Tagging Releases

### Version Format
```
v{major}.{minor}.{patch}

Examples:
v1.0.0  Initial release
v1.1.0  Minor feature addition
v1.1.1  Bug fix
v2.0.0  Major breaking change
```

### Creating Tags
```bash
# Lightweight tag
git tag v1.0.0

# Annotated tag (recommended)
git tag -a v1.0.0 -m "Version 1.0.0 release"

# Push tag
git push origin v1.0.0

# List tags
git tag -l
```

### Release Checklist
```
- [ ] All tests passing
- [ ] Build successful
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Commit with "chore: bump version"
- [ ] Create annotated tag
- [ ] Push tag to origin
- [ ] Create GitHub release
- [ ] Deploy to production
```

---

## 🔐 Security Best Practices

### Secrets Management
```bash
# ❌ Never commit secrets
.env.local (in .gitignore)
API_KEY in code

# ✅ Use environment variables
.env.example (without values)
Load from .env.local at runtime
```

### Git Security
```bash
# Sign commits (optional but recommended)
git commit -S -m "message"

# Verify commit signatures
git log --show-signature

# Set up GPG keys
gpg --list-keys
git config user.signingkey {KEY_ID}
```

### Repository Protection
```
Rules to implement:
- Require pull request reviews
- Dismiss stale PR approvals
- Require status checks to pass
- Restrict who can push
- Require branches to be up to date
```

---

## 📊 Useful Git Commands

### Daily Use
```bash
# Check status
git status

# View changes
git diff
git diff --staged

# Create branch
git checkout -b feature/name

# Switch branch
git checkout develop

# List branches
git branch -a

# Delete branch
git branch -d feature/name
```

### History & Investigation
```bash
# View commit history
git log --oneline
git log --graph --all

# Find who changed a line
git blame src/file.ts

# Find which commits changed a file
git log -- src/file.ts

# View a specific commit
git show abc123
```

### Undoing Changes
```bash
# Undo local changes
git checkout -- src/file.ts

# Undo staged changes
git reset HEAD src/file.ts

# Revert commit
git revert abc123

# Reset to commit
git reset --hard abc123
```

### Maintenance
```bash
# Clean up local branches
git branch -d merged_branch
git branch -D unmerged_branch

# Prune remote tracking branches
git fetch --prune

# Squash commits
git rebase -i HEAD~3

# Cherry pick commit
git cherry-pick abc123
```

---

## 🚀 Deployment Workflow

### Development
```
1. Create feature branch from develop
2. Commit changes with meaningful messages
3. Create pull request
4. Code review & approval
5. Merge to develop
6. Deploy to staging
```

### Staging
```
1. Test on staging environment
2. QA approval
3. Create release branch
4. Final tests
```

### Production
```
1. Merge release to main
2. Create version tag
3. Build for production
4. Deploy to production
5. Monitor for issues
```

---

## 📋 Team Conventions

### Code Standards
- Follow AGENTS.md guidelines
- Use TypeScript strictly
- Write tests for features
- Update documentation

### Communication
- Be respectful in reviews
- Ask questions, don't assume
- Provide context in commits
- Respond to feedback promptly

### Responsibility
- Own your changes
- Review others' code
- Share knowledge
- Help junior developers

### Quality
- All tests must pass
- No TypeScript errors
- Clean commit history
- Descriptive messages

---

## 🆘 Common Scenarios

### "I committed to wrong branch"
```bash
# Create correct branch
git checkout -b feature/correct develop

# Move commits
git cherry-pick abc123
git cherry-pick def456

# Go back to wrong branch
git checkout feature/wrong

# Remove commits
git reset --hard {original_hash}
```

### "I need to update my branch"
```bash
# Update from develop
git fetch origin
git rebase origin/develop

# If conflicts
# Fix them in editor
git add .
git rebase --continue

# Force push
git push origin feature/my-branch -f
```

### "I want to undo a commit"
```bash
# Keep changes, undo commit
git reset --soft HEAD~1

# Discard changes, undo commit
git reset --hard HEAD~1

# Revert commit (new commit)
git revert abc123
```

### "I need to split a commit"
```bash
# Start interactive rebase
git rebase -i HEAD~3

# Mark commit as 'edit'
# When it stops
git reset HEAD~1

# Stage and commit separately
git add part1
git commit -m "feat: part 1"

git add part2
git commit -m "feat: part 2"

# Continue rebase
git rebase --continue
```

---

## ✅ Pre-commit Checklist

Before pushing code:

```
Code Quality:
  [ ] npm run lint passes
  [ ] npm run build succeeds
  [ ] No console.log left
  [ ] No type errors
  [ ] No unused imports

Testing:
  [ ] Manually tested feature
  [ ] Existing tests still pass
  [ ] Edge cases handled

Git:
  [ ] Commits are atomic
  [ ] Messages are descriptive
  [ ] Branch is up to date
  [ ] No merge conflicts

Documentation:
  [ ] Code comments added
  [ ] README updated if needed
  [ ] Types are documented
  [ ] Complex logic explained
```

---

## 📚 Reference Links

### Git Guides
- [Git Documentation](https://git-scm.com/doc)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

### Project Resources
- **AGENTS.md** - Development conventions
- **ARCHITECTURE_GUIDE.md** - Code standards
- **QUICK_REFERENCE.md** - Code patterns

---

## 🎯 Summary

### Key Points
1. **Use feature branches** for all work
2. **Write descriptive commit messages**
3. **Keep commits atomic and focused**
4. **Request code reviews** before merging
5. **Keep branch updated** with develop
6. **Test before pushing** (lint & build)
7. **Communicate clearly** in reviews
8. **Follow conventions** from AGENTS.md

### Quick Checklist
```bash
# Daily workflow
git checkout -b feature/my-feature develop
# Make changes, test locally
npm run lint && npm run build
git commit -m "feat: my feature"
git push origin feature/my-feature
# Create pull request on GitHub
# Address review feedback
# Merge when approved
```

---

**Last Updated**: April 20, 2026
**Status**: ✅ Ready to Use
**Version**: 1.0
