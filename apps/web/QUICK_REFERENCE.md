# Quick Reference - Common Tasks

FastLookup guide for the most common development tasks.

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Start development server
pnpm dev

# 3. Open browser
http://localhost:5173
```

---

## 🔧 Common Commands

| Task | Command |
|------|---------|
| Start dev server | `pnpm dev` |
| Build for production | `pnpm build` |
| Check TypeScript & build | `pnpm build` |
| Run linting | `pnpm lint` |
| Auto-fix linting issues | `pnpm lint -- --fix` |
| Preview production build | `pnpm preview` |

---

## 📝 Creating a Component

### Step-by-step:

```typescript
// 1. Create component file
// src/components/MyPage.tsx

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./MyPage.css";

export default function MyPage() {
  const navigate = useNavigate();
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Load data
  }, []);
  
  return (
    <div className="container">
      {/* Content */}
    </div>
  );
}
```

```css
/* 2. Create styles
   src/components/MyPage.css */

.container {
  padding: 20px;
}
```

```tsx
// 3. Add to App.tsx
import MyPage from "./components/MyPage";

// In Routes section:
<Route
  path="/mypage"
  element={
    <SessionAuth>
      <MyPage />
    </SessionAuth>
  }
/>
```

```tsx
// 4. Navigate from other component
<button onClick={() => navigate("/mypage")}>
  Go to My Page
</button>
```

---

## 🔗 Making API Calls

```typescript
// Basic GET
const fetchData = async () => {
  const response = await fetch('http://localhost:3000/api/endpoint', {
    credentials: 'include',
  });
  const data = await response.json();
  return data;
};

// POST request
const postData = async (payload) => {
  const response = await fetch('http://localhost:3000/api/endpoint', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json();
};

// In component
useEffect(() => {
  fetchData().then(data => setData(data)).catch(err => console.error(err));
}, []);
```

---

## 🎯 Navigation

```typescript
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

// Navigate to page
navigate("/path");

// Go back
navigate(-1);

// Navigate with state
navigate("/path", { state: { id: 123 } });
```

---

## 🔐 Check User Authentication

```typescript
import Session from "supertokens-auth-react/recipe/session";

// Check if logged in
if (await Session.doesSessionExist()) {
  // User is logged in
}

// Get user data from JWT
const payload = await Session.getAccessTokenPayloadSecurely();
const userId = payload.sub;
const email = payload.email;
const roles = payload.roles?.roles || [];

// Logout
const { signOut } = require("supertokens-auth-react/recipe/session");
await signOut();
```

---

## 📊 Common Patterns

### State Management

```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const load = async () => {
    setLoading(true);
    try {
      const result = await fetch(...);
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  load();
}, [dependency]);

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;
return <div>{data && <div>{data}</div>}</div>;
```

### Form Handling

```typescript
const [form, setForm] = useState({ name: '', email: '' });

const handleChange = (e) => {
  setForm({
    ...form,
    [e.target.name]: e.target.value,
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  const response = await fetch('/api/submit', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  });
  
  const result = await response.json();
};

return (
  <form onSubmit={handleSubmit}>
    <input
      name="name"
      value={form.name}
      onChange={handleChange}
    />
    <button type="submit">Submit</button>
  </form>
);
```

### Error Handling

```typescript
try {
  const response = await fetch(url, { credentials: 'include' });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const data = await response.json();
  // Use data
} catch (error) {
  if (error instanceof TypeError) {
    console.error('Network error:', error);
  } else {
    console.error('Error:', error.message);
  }
  // Show error to user
}
```

---

## 🐛 Debugging

### Check Browser Console
```
Press F12 → Console tab
Look for red errors
```

### Check Network Requests
```
Press F12 → Network tab
Perform action
Check request status (should be 200)
Click request to see details
```

### Check React State
```
Install React DevTools extension
Open DevTools → React tab
Inspect component props/state
```

### Log Data
```typescript
console.log("Variable name:", value);
console.error("Error message:", error);
console.group("Data");
  console.log(data1, data2);
console.groupEnd();
```

---

## ⚠️ Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Port 5173 in use | `pnpm dev -- --port 5174` |
| Backend not found | Check backend running on :3000 |
| HMR not working | Restart dev server |
| Session expired | Clear cookies, login again |
| API CORS error | Ensure `credentials: 'include'` |
| TypeScript errors | Run `pnpm build` to see all |
| Dependencies not found | Run `pnpm install` |
| Build fails | Check for TS errors, invalid imports |

---

## 📚 Available Routes

```typescript
/              // Dashboard (main page)
/home          // Home page
/discover      // Browse books
/books         // Browse books (alias)
/search        // Search books
/onboarding    // New user setup
/auth/*        // Authentication pages
```

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Routing & setup |
| `src/components/Dashboard.tsx` | Main dashboard |
| `src/components/Home.tsx` | Home page |
| `src/components/Discover.tsx` | Book discovery |
| `src/components/Search.tsx` | Search |
| `src/components/OnboardingScreen.tsx` | New user setup |
| `vite.config.ts` | Build configuration |
| `tsconfig.json` | TypeScript configuration |
| `package.json` | Dependencies |

---

## 📖 Full Documentation

- **Main docs:** [WEB_DOCUMENTATION.md](./WEB_DOCUMENTATION.md)
- **Components:** [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md)
- **API:** [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)
- **Setup:** [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
- **Index:** [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)

---

## 🚨 Emergency Commands

```bash
# Clear and reinstall
rm -r node_modules pnpm-lock.yaml
pnpm install

# Restart dev server
# Press Ctrl+C then:
pnpm dev

# Check TypeScript errors
pnpm build

# Force hard refresh
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

---

**Last Updated:** February 2026
