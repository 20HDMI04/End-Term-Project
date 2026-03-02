# Component Development Guide

## Overview

This guide provides detailed information about each component in the web application and how to develop new ones.

---

## Component Template

Use this template when creating new components:

```typescript
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./ComponentName.css";

export default function ComponentName() {
  const navigate = useNavigate();
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialization logic
  }, []);

  const handleAction = async () => {
    setLoading(true);
    try {
      // Business logic
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container">
      {/* JSX content */}
    </div>
  );
}
```

---

## Dashboard Component

### Location
`src/components/Dashboard.tsx` & `Dashboard.css`

### Purpose
Main landing page showing user information and app overview

### Features
- User authentication display
- User role management
- Data fetching from backend
- Session management
- Logout functionality

### State Variables
```typescript
const [roles, setRoles] = useState<string[]>([]);
const [isCheckingRole, setIsCheckingRole] = useState(true);
```

### Key Methods

#### `checkUserRole()`
Fetches user roles from JWT token

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

**Returns:** `string[]` - Array of user roles

#### `handleLogout()`
Signs out user and redirects to auth page

```typescript
const handleLogout = async () => {
  await signOut();
  navigate("/auth");
};
```

### Hooks Used
- `useNavigate` - Route navigation
- `useSessionContext` - Session data access
- `useEffect` - Side effects (role checking, data fetching)
- `useState` - Local state management

### Styling Classes
- `.dashboard-container` - Main wrapper
- `.dashboard-card` - Content card
- `.dashboard-header` - Header section
- `.user-roles` - Roles display
- `.role-badge` - Individual role styling

### Flow
1. Component mounts
2. Check if user has `new_User` role
3. If yes → redirect to `/onboarding`
4. If no → fetch user data from backend
5. Display dashboard with user info

---

## OnboardingScreen Component

### Location
`src/components/OnboardingScreen.tsx` & `OnboardingScreen.css`

### Purpose
New user setup and profile completion

### Features
- Role verification
- Nickname input form
- API integration with backend
- Session refresh
- Auto-redirect on completion

### State Variables
```typescript
const [nickname, setNickname] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Key Methods

#### `handleCompleteOnboarding()`
Submits onboarding form and completes setup

```typescript
const handleCompleteOnboarding = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!nickname.trim()) {
    setError("Nickname is required");
    return;
  }

  setLoading(true);
  try {
    const form = new FormData();
    form.append("nickname", nickname);

    const response = await fetch(
      `http://localhost:3000/user/me-the-first-time`,
      {
        method: "PATCH",
        credentials: "include",
        body: form,
      }
    );

    if (!response.ok) throw new Error("Failed");

    await Session.attemptRefreshingSession();
    navigate("/");
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Form Validation
- Nickname cannot be empty
- Changes persist to backend
- Error messages shown to user

### Styling
- Gradient background (purple theme)
- Centered card layout
- Smooth animations
- Responsive design

### User Experience
- Loading state during submission
- Error messages for failures
- Success info about next steps
- Automatic redirection on success

---

## Home Component

### Location
`src/components/Home.tsx`

### Current Status
Empty - Ready for implementation

### Suggested Features
1. **User's Reading List**
   - Books currently reading
   - Completion percentage
   - Last updated info

2. **Recent Activity**
   - Recently added books
   - Ratings submitted
   - Comments posted

3. **Quick Stats**
   - Total books read
   - Books in progress
   - Average rating given

4. **Quick Actions**
   - Continue reading
   - Add book
   - Write review

### Implementation Example

```typescript
export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserBooks = async () => {
      try {
        const response = await fetch(
          'http://localhost:3000/books/user-list',
          {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        const data = await response.json();
        setBooks(data);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBooks();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="home-container">
      <h1>Welcome Back!</h1>
      {/* Display books */}
    </div>
  );
}
```

---

## Discover Component

### Location
`src/components/Discover.tsx`

### Current Status
Empty - Ready for implementation

### Suggested Features
1. **Browse Books**
   - Featured books carousel
   - Latest releases
   - Popular books
   - Trending books

2. **Filtering**
   - By genre
   - By author
   - By rating
   - By publish date

3. **Sorting**
   - By rating
   - By popularity
   - By date added
   - A-Z

4. **Book Cards**
   - Cover image
   - Title and author
   - Rating
   - Quick preview
   - Add to list button

### Implementation Example

```typescript
export default function Discover() {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('rating');

  useEffect(() => {
    const fetchBooks = async () => {
      const query = new URLSearchParams({
        filter,
        sort,
        limit: '20',
      });

      const response = await fetch(
        `http://localhost:3000/books?${query}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      setBooks(data);
    };

    fetchBooks();
  }, [filter, sort]);

  return (
    <div className="discover-container">
      <div className="filters">
        {/* Filter UI */}
      </div>
      <div className="books-grid">
        {/* Book cards */}
      </div>
    </div>
  );
}
```

---

## Search Component

### Location
`src/components/Search.tsx`

### Current Status
Empty - Ready for implementation

### Suggested Features
1. **Search Input**
   - Real-time search
   - Debounced API calls
   - Clear button

2. **Search Types**
   - By title
   - By author
   - By ISBN
   - Advanced search

3. **Results Display**
   - Relevance ranking
   - Pagination
   - Result count
   - No results handling

4. **Search History**
   - Recent searches
   - Saved searches (future)
   - Clear history

### Implementation Example

```typescript
export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      const searchBooks = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `http://localhost:3000/books/search?q=${encodeURIComponent(query)}`,
            { credentials: 'include' }
          );
          const data = await response.json();
          setResults(data);
        } finally {
          setLoading(false);
        }
      };

      searchBooks();
    }, 500); // Debounce

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search books, authors..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {/* Results display */}
    </div>
  );
}
```

---

## AuthLayout Component

### Location
`src/components/AuthLayout.tsx`

### Purpose
Wrapper for authentication pages with consistent styling

### Current Features
- Logo display
- Centered layout
- Background styling

### Usage
Used internally by SuperTokens auth pages

### Styling Classes
- `.auth-page-wrapper` - Main container
- `.auth-logo` - Logo section

---

## Creating New Components

### Step 1: Create Component File

```typescript
// src/components/NewComponent.tsx
import { useNavigate } from "react-router-dom";
import "./NewComponent.css";

export default function NewComponent() {
  const navigate = useNavigate();

  return (
    <div className="new-component">
      <h1>New Component</h1>
    </div>
  );
}
```

### Step 2: Create Styles

```css
/* src/components/NewComponent.css */
.new-component {
  padding: 20px;
  /* styling */
}
```

### Step 3: Add to Routing

```typescript
// In App.tsx
import NewComponent from "./components/NewComponent";

// In Routes section
<Route
  path="/new"
  element={
    <SessionAuth>
      <NewComponent />
    </SessionAuth>
  }
/>
```

### Step 4: Add Navigation Link

```typescript
<button onClick={() => navigate("/new")}>Go to New Component</button>
```

---

## Common Patterns

### Data Fetching

```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/endpoint', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('API error');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
```

### Form Handling

```typescript
const [formData, setFormData] = useState({ field: '' });
const [errors, setErrors] = useState({});

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.field) {
    setErrors({ field: 'Required' });
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/submit', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    // Handle response
  } catch (error) {
    setErrors({ submit: error.message });
  }
};
```

### Conditional Rendering

```typescript
if (loading) return <div className="loading">Loading...</div>;
if (error) return <div className="error">Error: {error}</div>;
if (!data) return <div>No data found</div>;

return <div>{/* render data */}</div>;
```

### Navigation

```typescript
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

// Navigate on action
<button onClick={() => navigate("/path")}>Go</button>

// Navigate with state
<button onClick={() => navigate("/path", { state: { id: 123 } })}>Go</button>

// Go back
<button onClick={() => navigate(-1)}>Back</button>
```

---

## Testing Components

### Manual Testing Checklist
1. ✅ Component renders without errors
2. ✅ Navigation works correctly
3. ✅ API calls succeed
4. ✅ Form validation works
5. ✅ Error handling displays properly
6. ✅ Loading states show
7. ✅ Responsive on mobile
8. ✅ No console errors

### Chrome DevTools Testing
1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for API calls
4. Use React DevTools to inspect state
5. Test responsive design (Ctrl+Shift+M)

---

## Performance Tips

1. **Memoize expensive components**
   ```typescript
   const MyComponent = React.memo(function MyComponent(props) {
     return <div>{props.value}</div>;
   });
   ```

2. **Use useCallback for functions**
   ```typescript
   const handleClick = useCallback(() => {
     // action
   }, [dependency]);
   ```

3. **Debounce frequent updates**
   ```typescript
   useEffect(() => {
     const timer = setTimeout(() => {
       // action
     }, 300);
     return () => clearTimeout(timer);
   }, [query]);
   ```

4. **Optimize API calls**
   - Cache data locally
   - Avoid fetching on every render
   - Use proper dependencies in useEffect

---

**Last Updated:** February 2026
