# Readsy Web Application - Complete Documentation

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Overview](#project-overview)
3. [Architecture](#architecture)
4. [Directory Structure](#directory-structure)
5. [Setup & Installation](#setup--installation)
6. [Running the Application](#running-the-application)
7. [Components Guide](#components-guide)
8. [Routing](#routing)
9. [Authentication](#authentication)
10. [API Integration](#api-integration)
11. [Development Guidelines](#development-guidelines)
12. [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint
```

Access the app at `http://localhost:5173`

---

## Project Overview

**Readsy** is a modern React-based web application for discovering, rating, and managing books. It integrates with a NestJS backend API and uses SuperTokens for authentication.

### Key Features
- 📚 Browse and discover books
- 🔍 Search functionality
- ⭐ Rate and review books
- 👥 User profiles and preferences
- 🎯 Personalized recommendations
- 🔐 Secure authentication with SuperTokens

### Tech Stack
- **React 19** - UI Framework
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **React Router v7** - Client-side routing
- **SuperTokens** - Authentication & Session management
- **TailwindCSS** (via custom CSS) - Styling

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2022+ JavaScript support required

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────┐
│           Readsy Web App                │
│         (React + TypeScript)            │
├─────────────────────────────────────────┤
│  SuperTokens Auth │ React Router │ API  │
├─────────────────────────────────────────┤
│  Backend API (NestJS) on :3000          │
│  - Authentication endpoints             │
│  - Book, Author, User APIs              │
│  - Rating & Review endpoints            │
├─────────────────────────────────────────┤
│  PostgreSQL Database                    │
└─────────────────────────────────────────┘
```

### Data Flow

```
User Interaction
    ↓
Components (React)
    ↓
useNavigate / useContext hooks
    ↓
API Calls (fetch)
    ↓
Backend (NestJS)
    ↓
Database (PostgreSQL)
```

### Authentication Flow

```
User → Auth Page → SuperTokens → Backend → JWT Token
                                       ↓
                            Stored in httpOnly Cookie
                                       ↓
                            SessionAuth wrapper validates
                                       ↓
                            Protected Routes accessible
```

---

## Directory Structure

```
web/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx          # Main dashboard page
│   │   ├── Dashboard.css          # Dashboard styling
│   │   ├── Home.tsx               # Home page
│   │   ├── Discover.tsx           # Book discovery page
│   │   ├── Search.tsx             # Search functionality
│   │   ├── AuthLayout.tsx         # Auth page wrapper
│   │   └── OnboardingScreen.tsx   # New user onboarding
│   ├── assets/                    # Static assets (imgs, fonts)
│   ├── App.tsx                    # Main app component & routing
│   ├── App.css                    # Global app styles
│   ├── main.tsx                   # React entry point
│   └── index.css                  # Global styles
├── public/                        # Static files (favicon, etc)
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript configuration
├── vite.config.ts                 # Vite configuration
├── eslint.config.js               # ESLint rules
├── index.html                     # HTML entry point
└── README.md                      # Original setup guide
```

### Key Directories Explained

#### `/src/components/`
Contains all React components. Each component handles a specific page or feature.
- Page components: Dashboard, Home, Discover, Search
- Layout components: AuthLayout, OnboardingScreen
- Pure components: Reusable UI elements

#### `/src/assets/`
Static assets referenced in components:
- Images (logos, backgrounds)
- Fonts (custom typography)
- SVGs (icons)
- Lottie animations

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- pnpm 9+
- Backend running on `http://localhost:3000`

### Installation Steps

1. **Navigate to web directory**
```bash
cd apps/web
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Verify backend is running**
   - Backend should be at `http://localhost:3000`
   - Check SETUP.md in project root

4. **Configure environment (if needed)**
   - Create `.env.local` if environment variables needed
   - Currently using `http://localhost:3000` as API domain

---

## Running the Application

### Development Mode
```bash
pnpm dev
```
- Starts Vite dev server at `http://localhost:5173`
- Hot Module Replacement (HMR) enabled
- Auto-refreshes on file changes

### Production Build
```bash
pnpm build
```
- Compiles TypeScript: `tsc -b`
- Bundles with Vite
- Outputs to `dist/` directory
- Optimized for performance

### Preview Production Build
```bash
pnpm preview
```
- Serves the production build locally
- Useful for testing before deployment

### Linting
```bash
pnpm lint
```
- Runs ESLint on all files
- Checks code quality and style

---

## Components Guide

### Dashboard Component
**File:** `src/components/Dashboard.tsx`

**Purpose:** Main application dashboard and entry point

**Key Features:**
- Displays logged-in user information
- Shows user roles and permissions
- Fetches user data from backend
- Role-based redirects (new users → onboarding)
- Logout functionality

**State Management:**
```typescript
const [roles, setRoles] = useState<string[]>([]);
const [isCheckingRole, setIsCheckingRole] = useState(true);
```

**Key Functions:**
- `checkUserRole()` - Retrieves user roles from JWT token
- `updateUserFirstTime()` - Updates user on first login
- `handleLogout()` - Signs out user and redirects to auth

**Used Hooks:**
- `useNavigate` - Navigation
- `useSessionContext` - Session data
- `useEffect` - Side effects (role checking, data fetching)
- `useState` - Local state

**Styling:** `Dashboard.css`

---

### Home Component
**File:** `src/components/Home.tsx`

**Purpose:** User's home page with personalized content

**Status:** Currently empty - ready for implementation

**Suggested Features:**
- User's current reading list
- Recently added books
- Reading progress
- Personalized recommendations

---

### Discover Component
**File:** `src/components/Discover.tsx`

**Purpose:** Browse and discover books

**Status:** Currently empty - ready for implementation

**Suggested Features:**
- Featured books carousel
- Genre filtering
- Book recommendations
- Sort options (rating, date, popularity)
- Book cards with details

---

### Search Component
**File:** `src/components/Search.tsx`

**Purpose:** Search for books by title, author, etc.

**Status:** Currently empty - ready for implementation

**Suggested Features:**
- Search input field
- Real-time search results
- Filter options
- Search history
- Advanced search (author, genre, year)

---

### AuthLayout Component
**File:** `src/components/AuthLayout.tsx`

**Purpose:** Wrapper for authentication pages

**Features:**
- Displays Readsy logo
- Centered layout
- Consistent styling for auth flow

---

### OnboardingScreen Component
**File:** `src/components/OnboardingScreen.tsx`

**Purpose:** New user setup and profile creation

**Key Features:**
- Collects user nickname
- Verifies `new_User` role
- Calls `/user/me-the-first-time` endpoint
- Removes `new_User` role on completion
- Auto-redirects to dashboard

**Forms:**
- Nickname input with validation
- Error handling with user feedback
- Loading state during submission

**Styling:** `OnboardingScreen.css` (gradient theme, animations)

---

## Routing

### App Router Configuration
**File:** `src/App.tsx`

All routes are protected with `SessionAuth` - users must be logged in to access them.

### Available Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Dashboard | Main dashboard |
| `/home` | Home | Home page |
| `/discover` | Discover | Book discovery |
| `/books` | Discover | Book browsing (alias) |
| `/search` | Search | Search functionality |
| `/onboarding` | OnboardingScreen | New user setup |
| `/auth/*` | SuperTokens | Authentication pages |

### Route Structure in App.tsx

```typescript
<Routes>
  {/* SuperTokens routes */}
  {getSuperTokensRoutesForReactRouterDom(reactRouterDom, [...])}
  
  {/* Protected routes with SessionAuth */}
  <Route path="/onboarding" element={<SessionAuth><OnboardingScreen /></SessionAuth>} />
  <Route path="/" element={<SessionAuth><Dashboard /></SessionAuth>} />
  <Route path="/home" element={<SessionAuth><Home /></SessionAuth>} />
  <Route path="/discover" element={<SessionAuth><Discover /></SessionAuth>} />
  <Route path="/books" element={<SessionAuth><Discover /></SessionAuth>} />
  <Route path="/search" element={<SessionAuth><Search /></SessionAuth>} />
  
  {/* Redirects */}
  <Route path="/dashboard" element={<Navigate to="/" replace />} />
</Routes>
```

### Adding New Routes

1. **Create component** in `src/components/`
2. **Import in App.tsx**
3. **Add Route**:
```typescript
<Route
  path="/new-page"
  element={
    <SessionAuth>
      <YourComponent />
    </SessionAuth>
  }
/>
```

### Navigation Between Routes

Use `useNavigate` hook in components:

```typescript
import { useNavigate } from "react-router-dom";

export function MyComponent() {
  const navigate = useNavigate();
  
  return (
    <>
      <button onClick={() => navigate("/")}>Dashboard</button>
      <button onClick={() => navigate("/discover")}>Browse Books</button>
      <button onClick={() => navigate("/search")}>Search</button>
    </>
  );
}
```

---

## Authentication

### SuperTokens Integration

**Configuration:** `App.tsx` (lines 20-38)

```typescript
SuperTokens.init({
  appInfo: {
    appName: "Readsy",
    apiDomain: "http://localhost:3000",      // Backend
    websiteDomain: "http://localhost:5173",  // Frontend
    apiBasePath: "/auth",
    websiteBasePath: "/auth",
  },
  clientType: "web",
  recipeList: [
    EmailPassword.init({}),
    ThirdParty.init({ providers: [Google] }),
    Session.init({ sessionTokenFrontendDomain: "localhost" }),
  ],
});
```

### Session Management

**Access Token Payload:**
- Contains user ID, email, and roles
- Retrieved via `Session.getAccessTokenPayloadSecurely()`
- Automatically renewed by SuperTokens

**User Roles:**
Roles are stored in JWT and used for:
- Access control
- UI conditionals
- Route guards (onboarding redirect)

**Checking User Roles:**

```typescript
async function checkUserRole() {
  if (await Session.doesSessionExist()) {
    const payload = await Session.getAccessTokenPayloadSecurely();
    const roles = payload["roles"]?.roles || payload["roles"] || [];
    return roles;
  }
  return [];
}
```

### Protected Routes

All routes use `SessionAuth` wrapper:
```typescript
<Route path="/" element={<SessionAuth><Dashboard /></SessionAuth>} />
```

If session doesn't exist, user is redirected to `/auth` (handled by SuperTokens)

### Authentication Pages

SuperTokens provides built-in auth pages:
- Sign Up (`/auth/signup`)
- Sign In (`/auth/signin`)
- Account Recovery
- Email Verification

These are automatically integrated via `getSuperTokensRoutesForReactRouterDom()`

---

## API Integration

### Base Configuration

- **API Domain:** `http://localhost:3000`
- **Authentication:** Credentials (httpOnly cookies)
- **Content-Type:** `application/json`

### Making API Calls

**Example pattern used in Dashboard:**

```typescript
const response = await fetch('http://localhost:3000/user/me', {
  method: 'GET',
  credentials: 'include',  // Include cookies (session token)
  headers: {
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
```

### Key Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/*` | Various | SuperTokens auth endpoints |
| `/user/me` | GET | Get current user info |
| `/user/me-the-first-time` | PATCH | Complete onboarding |

### Error Handling

```typescript
try {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error('API error');
  const data = await response.json();
} catch (error) {
  console.error('Error:', error);
  // Handle error (show toast, update UI, etc)
}
```

### CORS & Credentials

- Backend configured to accept requests from `http://localhost:5173`
- `credentials: 'include'` ensures session cookies are sent
- Backend sets CORS headers to allow this

---

## Development Guidelines

### Code Style

- **Language:** TypeScript (strict mode)
- **Framework:** React 19 with Hooks
- **Formatting:** ESLint enforced
- **Naming:** camelCase for functions/variables, PascalCase for components

### Component Best Practices

1. **Functional Components Only**
   ```typescript
   export default function MyComponent() {
     return <div>...</div>;
   }
   ```

2. **Use Custom Hooks for Logic**
   ```typescript
   function useUserData() {
     const [data, setData] = useState(null);
     useEffect(() => {
       // Fetch logic
     }, []);
     return data;
   }
   ```

3. **Separate Styles**
   - Create `.css` file for each component
   - Name: `ComponentName.css`
   - Import in component

4. **Handle Loading States**
   ```typescript
   if (loading) return <div>Loading...</div>;
   ```

5. **Error Boundaries (Future)**
   - Consider adding Error Boundary component
   - Handle API errors gracefully

### File Organization

- One component per file
- Keep components focused on single responsibility
- Extract reusable logic to custom hooks
- Place utilities in separate files

### TypeScript Tips

- Define interfaces for API responses
- Use `readonly` for immutable data
- Avoid `any` type
- Use proper type for event handlers

### CSS Guidelines

- Use semantic class names
- Organize by sections/components
- Define color variables
- Use consistent spacing scale
- Support responsive design

### Testing (Future Implementation)

Plan to add:
- Unit tests with Jest
- Component tests with React Testing Library
- E2E tests with Cypress

---

## Troubleshooting

### Common Issues

#### Backend not responding
**Problem:** API calls fail with connection error
**Solution:**
1. Verify backend is running: `pnpm run dev --filter=backend`
2. Check backend is on `http://localhost:3000`
3. Verify Docker containers running: `docker compose up`

#### Session/Auth issues
**Problem:** User not staying logged in or getting logged out
**Solution:**
1. Check browser cookies (DevTools → Application → Cookies)
2. Verify SuperTokens config in `App.tsx`
3. Check backend auth endpoints responding correctly
4. Clear browser cache and cookies

#### Hot Module Replacement (HMR) not working
**Problem:** Changes not reflecting in browser
**Solution:**
1. Restart dev server: `Ctrl+C` then `pnpm dev`
2. Clear browser cache
3. Check console for errors
4. Verify Vite is running on correct port

#### TypeScript errors
**Problem:** TS compiler errors despite code looking correct
**Solution:**
1. Run `tsc -b` to check all errors
2. Restart dev server
3. Ensure proper imports from types package
4. Check `tsconfig.json` extends correct config

#### ESLint errors
**Problem:** Code fails linting but runs
**Solution:**
```bash
pnpm lint        # See all errors
pnpm lint -- --fix  # Auto-fix fixable errors
```

#### CORS errors
**Problem:** API requests blocked by CORS policy
**Solution:**
1. Verify backend CORS config allows `http://localhost:5173`
2. Check `Access-Control-Allow-Credentials: true` is set
3. Ensure `credentials: 'include'` in fetch options

#### Page redirects immediately
**Problem:** New user redirects to onboarding correctly
**Problem:** User stuck in redirect loop
**Solution:**
1. Check `/onboarding` page actually removes `new_User` role
2. Verify backend endpoint `/user/me-the-first-time` works
3. Check session refresh happens after update

### Debug Tips

1. **Check Network Tab**
   - DevTools → Network
   - Inspect API requests/responses
   - Verify status codes

2. **Check Console**
   - DevTools → Console
   - Components log user data and roles

3. **Check Application Tab**
   - Cookies (session token storage)
   - Local Storage (if used)

4. **Check React DevTools Extension**
   - Component tree inspection
   - Props/state debugging
   - Hook values

5. **Temporary Logging**
   ```typescript
   console.log("User roles:", roles);
   console.log("Response:", data);
   ```

---

## Contributing

### Before Committing

1. **Check linting:** `pnpm lint`
2. **Build check:** `pnpm build`
3. **Test in browser:** `pnpm dev`
4. **No console errors**

### Adding Features

1. Create component file
2. Add TypeScript types
3. Create corresponding CSS file
4. Add to routing in `App.tsx`
5. Test thoroughly
6. Document in this guide if needed

### Pull Request Checklist

- [ ] Code passes ESLint
- [ ] No TypeScript errors
- [ ] Component tested in dev
- [ ] Mobile responsive (if applicable)
- [ ] No breaking changes
- [ ] Documentation updated

---

## Additional Resources

### External Documentation
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [React Router Docs](https://reactrouter.com)
- [Vite Docs](https://vitejs.dev)
- [SuperTokens Docs](https://supertokens.com/docs)

### Project Structure References
- Main project SETUP.md
- Backend documentation
- Type definitions in `@repo/types`

---

## Deployment (Future)

### Build & Deploy Steps
1. Run `pnpm build` to create production bundle
2. Output in `dist/` directory
3. Deploy to hosting service (Vercel, Netlify, etc.)
4. Update backend URL if using production backend
5. Configure environment variables for production

---

**Last Updated:** February 2026
**Version:** 1.0.0
