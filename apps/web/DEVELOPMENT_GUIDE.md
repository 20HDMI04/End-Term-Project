# Development Setup & Troubleshooting

## Quick Links
- [Initial Setup](#initial-setup)
- [Running the App](#running-the-app)
- [Common Issues](#common-issues)
- [Development Workflow](#development-workflow)
- [Performance Optimization](#performance-optimization)
- [Debugging Guide](#debugging-guide)

---

## Initial Setup

### Prerequisites
- **Node.js** 18+ (`node --version`)
- **pnpm** 9+ (`pnpm --version`)
- **Backend** running on `http://localhost:3000`
- **Docker** (for database - if using docker-compose)

### Installation

```bash
# 1. Navigate to workspace root
cd End-Term-Project

# 2. Install all dependencies
pnpm install

# 3. Navigate to web app
cd apps/web

# 4. Verify installation
pnpm --version
node --version
```

### First-Time Configuration

```bash
# From apps/web directory

# 1. Build to check for TypeScript errors
pnpm build

# 2. Run linting to check code quality
pnpm lint

# 3. Start development server
pnpm dev
```

### Backend Requirements

The web app requires the backend API running:

```bash
# In separate terminal, from apps/backend
pnpm install
pnpm run dev

# This starts:
# - NestJS API on http://localhost:3000
# - PostgreSQL database (via docker-compose)
# - SuperTokens integration
```

**Verify backend:**
```bash
curl http://localhost:3000/health
# Should return { status: "ok" } or similar
```

---

## Running the App

### Development Server

```bash
pnpm dev
```

Opens at: `http://localhost:5173`

**Features:**
- Hot Module Replacement (HMR)
- Auto-refresh on code changes
- Source maps for debugging
- Console for error messages

**Stop:** Press `Ctrl+C`

### Production Build

```bash
pnpm build
```

**Outputs:** `dist/` directory with optimized bundle

**Before building:**
1. Ensure no TypeScript errors: `pnpm lint`
2. All imports are correct
3. Environment variables set

### Preview Production Build

```bash
pnpm preview
```

Serves production build locally at `http://localhost:4173`

### Linting & Type Checking

```bash
# Check for errors (doesn't fix)
pnpm lint

# TypeScript compilation check
pnpm build  # include this step
```

---

## Project Structure Reference

```
web/
├── src/
│   ├── App.tsx                 # Main app + routing
│   ├── main.tsx                # React entry point
│   ├── index.css               # Global styles
│   ├── App.css                 # App-level styles
│   ├── components/             # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Home.tsx
│   │   ├── Discover.tsx
│   │   ├── Search.tsx
│   │   ├── OnboardingScreen.tsx
│   │   └── *.css               # Component styles
│   └── assets/                 # Images, fonts, etc
├── public/                     # Static files
├── dist/                       # Build output (generated)
├── package.json                # Dependencies
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
└── index.html                  # HTML entry point
```

---

## Common Issues

### 1. Port Already in Use

**Problem:** `Port 5173 is in use`

**Solutions:**
```bash
# Option A: Use different port
pnpm dev -- --port 5174

# Option B: Kill process using port (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Option B: Kill process using port (Mac/Linux)
lsof -ti:5173 | xargs kill -9
```

---

### 2. Backend Not Responding

**Problem:** `Cannot connect to http://localhost:3000`

**Solutions:**
```bash
# 1. Check backend is running
curl http://localhost:3000/health

# 2. Start backend in separate terminal
cd apps/backend
pnpm install
pnpm run dev

# 3. Check Docker containers (if using docker-compose)
docker compose up -d
```

---

### 3. Dependencies Not Installing

**Problem:** `pnpm install` fails or takes too long

**Solutions:**
```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules and reinstall
rm -r node_modules pnpm-lock.yaml
pnpm install

# Install specific package
pnpm add package-name

# Check pnpm version
pnpm --version  # Should be 9+
```

---

### 4. TypeScript Errors

**Problem:** Red squiggly lines in editor

**Solutions:**
```bash
# 1. Check TypeScript errors
pnpm build

# 2. Restart TypeScript server
# VSCode: Ctrl+Shift+P → "TypeScript: Restart TS Server"

# 3. Verify tsconfig.json is correct
# Check extends path is valid

# 4. Enable Type Checking in VSCode
# Settings → Editor: Code Lens
```

---

### 5. HMR Not Working

**Problem:** Changes don't appear in browser after file save

**Solutions:**
```bash
# 1. Restart dev server
# Press Ctrl+C and run: pnpm dev

# 2. Check for errors in console
# Look for TypeScript/build errors

# 3. Check Vite config
# vite.config.ts might need HMR settings

# 4. Hard refresh browser
# Ctrl+Shift+R (or Cmd+Shift+R on Mac)

# 5. Clear browser cache
# DevTools → Network → Disable cache (while open)
```

---

### 6. Session/Authentication Issues

**Problem:** Keep getting logged out or auth fails

**Solutions:**
```bash
# 1. Check cookies in browser
# DevTools → Application → Cookies → Check for sIRTFrontend

# 2. Clear cookies and login again
# DevTools → Application → Cookies → Delete all

# 3. Verify backend auth endpoints
curl http://localhost:3000/auth/verify

# 4. Check SuperTokens config in App.tsx
# Ensure apiDomain matches backend

# 5. Session refresh
# In console: Session.attemptRefreshingSession()
```

---

### 7. CORS Errors

**Problem:** `Access to fetch blocked by CORS policy`

**Solutions:**
```bash
# 1. Ensure credentials are included
fetch(url, { credentials: 'include' })

# 2. Check backend CORS headers
# Look in backend console for CORS config

# 3. Verify OPTIONS request succeeds
# Network tab → Check OPTIONS request status

# 4. Ensure backend allows localhost:5173
# Check CORS config in backend main.ts
```

---

### 8. Build Fails

**Problem:** `pnpm build` returns errors

**Solutions:**
```bash
# 1. Check TypeScript errors (most common)
pnpm build  # Shows errors

# 2. Check for import errors
# Verify all imports point to correct files

# 3. Check for missing dependencies
pnpm ls package-name

# 4. Verify CSS is valid
# Look for CSS parsing errors

# 5. Clear build cache
rm -r dist tsconfig.tsbuildinfo
pnpm build
```

---

## Development Workflow

### Starting Fresh

```bash
# 1. Terminal 1: Backend
cd apps/backend
pnpm install
pnpm run dev

# 2. Terminal 2: Web (from root)
cd apps/web
pnpm install
pnpm dev

# 3. Open browser
http://localhost:5173
```

### Making Changes

```bash
# 1. Edit component file
# src/components/MyComponent.tsx

# 2. Save file
# HMR hot-reloads automatically

# 3. Check for errors in browser console

# 4. Test functionality

# 5. Commit when working
git add .
git commit -m "description"
```

### Before Pushing

```bash
# 1. Run linting
pnpm lint

# 2. Check TypeScript
pnpm build

# 3. Test in browser
pnpm dev

# 4. No console errors?
# Yes → Ready to commit

# 5. Format code if available
pnpm lint -- --fix
```

---

## Performance Optimization

### Development Performance

```bash
# 1. If builds are slow
# Check for large dependencies
pnpm ls --depth=0

# 2. Reduce console logging
# Remove console.log in production code

# 3. Check for unnecessary re-renders
# Use React DevTools Profiler
```

### Bundle Size

```bash
# 1. Check bundle size after build
# dist/ folder size

# 2. Analyze bundle (if available)
# Look for large dependencies

# 3. Clear unused imports
# ESLint will help identify

# 4. Code splitting (advanced)
# React Router handles route-based splitting
```

### API Performance

```typescript
// 1. Debounce frequent requests
useEffect(() => {
  const timer = setTimeout(() => {
    fetch(url)
  }, 300)
  return () => clearTimeout(timer)
}, [query])

// 2. Cache response data
const cache = new Map()

// 3. Avoid fetching on every render
// Proper dependency arrays in useEffect
```

---

## Debugging Guide

### Browser DevTools

**Console Tab:**
```javascript
// Test API calls
fetch('http://localhost:3000/user/me', {
  credentials: 'include'
}).then(r => r.json())

// Check user data
Session.getAccessTokenPayloadSecurely()

// Check session exists
Session.doesSessionExist()
```

**Network Tab:**
1. Click Network tab
2. Perform action
3. Check requests:
   - Status should be 200, 201, etc. (not 4xx, 5xx)
   - Request headers should include cookies
   - Response body visible below

**Application Tab:**
- Cookies: Check `sIRTFrontend` exists
- Local Storage: Check app data stored
- Session Storage: Check temporary data

### React DevTools Extension

```bash
# 1. Install React DevTools browser extension

# 2. In DevTools "React" tab:
# - Inspect component tree
# - View props and state
# - Track renders

# 3. Profiler tab:
# - Record interaction
# - See which components re-render
# - Identify performance issues
```

### VS Code Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/apps/web/src"
    }
  ]
}
```

### Logging Best Practices

```typescript
// Good logging
console.log("User ID:", userId);
console.error("API Error:", error.message);
console.group("User Data");
console.log(userData);
console.groupEnd();

// Remove before build
console.log("Debug info"); // Remove this line

// Use if available
console.debug("Development only", data);
```

---

## Environment Variables

### Setting Up .env Files

```bash
# Create .env.local in apps/web (if needed)
echo "VITE_API_URL=http://localhost:3000" > .env.local
```

### Using in Code

```typescript
// Vite env vars must start with VITE_
const API_URL = import.meta.env.VITE_API_URL;
```

### Development vs Production

```typescript
// Check environment
if (import.meta.env.DEV) {
  // Development only
  console.log(data);
}

if (import.meta.env.PROD) {
  // Production only
  // Send to analytics
}
```

---

## Git Workflow

### Before Committing

```bash
# 1. Check for changes
git status

# 2. Stage changes
git add .

# 3. Verify no console errors
pnpm dev  # Test locally

# 4. Run linting
pnpm lint

# 5. Check build
pnpm build

# 6. Commit
git commit -m "meaningful message"

# 7. Push
git push
```

### Useful Git Commands

```bash
# See what changed
git diff src/components/Dashboard.tsx

# View commit history
git log --oneline -10

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo changes to file
git checkout -- src/components/Dashboard.tsx

# Switch branch
git checkout feature-branch
git checkout -b new-branch
```

---

## Useful VS Code Extensions

Recommended for development:

1. **ES7+ React/Redux/React-Native snippets**
   - Quickly create component templates

2. **TypeScript Vue Plugin**
   - Better TypeScript support

3. **ESLint**
   - Real-time linting feedback

4. **Prettier**
   - Code formatting

5. **REST Client**
   - Test API endpoints in editor

6. **Thunder Client**
   - Alternative REST client

---

## Quick Command Reference

| Command | Purpose |
|---------|---------|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start dev server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Check code quality |
| `pnpm lint -- --fix` | Auto-fix linting issues |

---

## Getting Help

1. **Check this documentation**
2. **Look at console errors** (DevTools)
3. **Check Network tab** (API issues)
4. **Search error message** online
5. **Check backend logs**
6. **Review git commit history** for clues
7. **Ask in team chat**

---

**Last Updated:** February 2026
**Version:** 1.0.0
