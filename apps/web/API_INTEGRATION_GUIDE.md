# API Integration Guide

## Overview

This guide covers how to integrate with the Readsy backend APIs from the web application.

---

## Base Configuration

### API Server
- **Host:** `localhost`
- **Port:** `3000`
- **Base URL:** `http://localhost:3000`
- **Protocol:** HTTP (development), HTTPS (production)

### Authentication
- **Method:** Session-based with httpOnly cookies
- **Token Type:** JWT (from SuperTokens)
- **Header:** Automatic via session management
- **Cookie:** `sIRTFrontend` (SuperTokens session cookie)

### Default Request Options

```typescript
const defaultOptions = {
  method: 'GET',
  credentials: 'include',  // Always include cookies
  headers: {
    'Content-Type': 'application/json',
  },
};
```

---

## Making API Calls

### Basic GET Request

```typescript
const fetchUserData = async () => {
  try {
    const response = await fetch('http://localhost:3000/user/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

### POST Request with Body

```typescript
const createBook = async (bookData) => {
  try {
    const response = await fetch('http://localhost:3000/books', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookData),
    });

    if (!response.ok) {
      throw new Error('Failed to create book');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

### PATCH Request (Update)

```typescript
const updateUserNickname = async (nickname) => {
  const form = new FormData();
  form.append('nickname', nickname);

  try {
    const response = await fetch(
      'http://localhost:3000/user/me-the-first-time',
      {
        method: 'PATCH',
        credentials: 'include',
        body: form,
      }
    );

    if (!response.ok) throw new Error('Update failed');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

### DELETE Request

```typescript
const deleteBook = async (bookId) => {
  try {
    const response = await fetch(
      `http://localhost:3000/books/${bookId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    if (!response.ok) throw new Error('Delete failed');
    return response.ok;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

---

## API Endpoints

### Authentication Endpoints
Handled by SuperTokens automatically

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/signup` | POST | User registration |
| `/auth/signin` | POST | User login |
| `/auth/signout` | POST | User logout |
| `/auth/verify` | GET | Verify session |

### User Endpoints

#### Get Current User
```
GET /user/me
Cookies: [session token]
Response: { id, email, username, nickname, ... }
```

**Usage:**
```typescript
const response = await fetch('http://localhost:3000/user/me', {
  credentials: 'include',
});
const userData = await response.json();
```

#### Complete First-Time Setup
```
PATCH /user/me-the-first-time
Body: FormData { nickname }
Response: { success, updatedUser }
```

**Usage:**
```typescript
const form = new FormData();
form.append('nickname', 'MyNickname');

const response = await fetch(
  'http://localhost:3000/user/me-the-first-time',
  {
    method: 'PATCH',
    credentials: 'include',
    body: form,
  }
);
```

### Book Endpoints (Expected)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/books` | GET | List books (with filters) |
| `/books/:id` | GET | Get single book |
| `/books` | POST | Create book |
| `/books/:id` | PATCH | Update book |
| `/books/:id` | DELETE | Delete book |

### Rating Endpoints (Expected)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/books/:id/ratings` | GET | Get book ratings |
| `/books/:id/rate` | POST | Rate a book |
| `/ratings/:id` | PATCH | Update rating |

### Comment Endpoints (Expected)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/books/:id/comments` | GET | Get comments |
| `/books/:id/comments` | POST | Add comment |
| `/comments/:id` | DELETE | Delete comment |

---

## Query Parameters

### Pagination

```typescript
// Get books with pagination
const url = new URL('http://localhost:3000/books');
url.searchParams.append('page', '1');
url.searchParams.append('limit', '20');

const response = await fetch(url, {
  credentials: 'include',
});
```

### Filtering

```typescript
// Get books by genre
const url = new URL('http://localhost:3000/books');
url.searchParams.append('genre', 'Science Fiction');

const response = await fetch(url, {
  credentials: 'include',
});
```

### Sorting

```typescript
// Sort books by rating descending
const url = new URL('http://localhost:3000/books');
url.searchParams.append('sort', 'rating');
url.searchParams.append('order', 'desc');

const response = await fetch(url, {
  credentials: 'include',
});
```

### Search

```typescript
// Search for books
const query = 'Harry Potter';
const url = `http://localhost:3000/books/search?q=${encodeURIComponent(query)}`;

const response = await fetch(url, {
  credentials: 'include',
});
```

---

## Error Handling

### HTTP Status Codes

| Status | Meaning | Action |
|--------|---------|--------|
| 200 | OK | Proceed with data |
| 201 | Created | Resource created |
| 204 | No Content | Success, no data |
| 400 | Bad Request | Check request format |
| 401 | Unauthorized | User not logged in |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Backend issue |

### Error Response Pattern

```typescript
// API error responses typically follow this pattern:
{
  error: {
    code: 'ERROR_CODE',
    message: 'Human readable message',
    details: {} // Additional error info
  }
}
```

### Handling Errors

```typescript
const fetchData = async () => {
  try {
    const response = await fetch(url, { credentials: 'include' });

    // Check HTTP status
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API error');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      console.error('Network error:', error);
      // Network connectivity issue
    } else {
      console.error('API error:', error.message);
      // API returned an error
    }
    throw error;
  }
};
```

### 401 Handling (Session Expired)

```typescript
const fetchWithSessionCheck = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      ...options,
    });

    if (response.status === 401) {
      // Redirect to login
      window.location.href = '/auth/signin';
      return null;
    }

    return response;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

---

## Reusable API Functions

### Create API Client Abstraction

```typescript
// api/client.ts
const API_BASE = 'http://localhost:3000';

async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API Error');
  }

  if (response.status === 204) {
    return { success: true } as T;
  }

  return response.json();
}

export const api = {
  // User endpoints
  user: {
    getCurrent: () => apiCall('/user/me'),
    completeOnboarding: (nickname: string) => {
      const form = new FormData();
      form.append('nickname', nickname);
      return apiCall('/user/me-the-first-time', {
        method: 'PATCH',
        body: form,
      });
    },
  },

  // Book endpoints
  books: {
    list: (params?: Record<string, string>) => {
      const url = new URL(`${API_BASE}/books`);
      Object.entries(params || {}).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
      return apiCall(url.pathname + url.search);
    },
    get: (id: string) => apiCall(`/books/${id}`),
    create: (data: unknown) =>
      apiCall('/books', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: unknown) =>
      apiCall(`/books/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiCall(`/books/${id}`, { method: 'DELETE' }),
  },
};
```

### Usage

```typescript
// In component
const { data: user, error: fetchError, loading } = await api.user.getCurrent();

const books = await api.books.list({ genre: 'Fiction', limit: '20' });

const newBook = await api.books.create({
  title: 'New Book',
  author: 'Author Name',
});
```

---

## Data Types/Interfaces

### User

```typescript
interface User {
  id: string;
  email: string;
  username: string;
  nickname?: string;
  smallerProfilePic?: string;
  biggerProfilePic?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Book (Expected)

```typescript
interface Book {
  id: string;
  title: string;
  authorId: string;
  googleBookId?: string;
  openLibraryId?: string;
  smallerCoverPic: string;
  biggerCoverPic: string;
  description: string;
  pageNumber?: number;
  rating?: number;
  ratingCount?: number;
  createdAt: string;
  updatedAt: string;
}
```

### Rating (Expected)

```typescript
interface Rating {
  id: string;
  userId: string;
  bookId: string;
  score: number; // 1-5
  createdAt: string;
  updatedAt: string;
}
```

### Comment (Expected)

```typescript
interface Comment {
  id: string;
  userId: string;
  bookId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## Testing API Calls

### Using Browser DevTools

1. **Open Network Tab (F12)**
   - See all API requests
   - Check status codes
   - Inspect request/response bodies
   - Monitor timing

2. **Test in Console**
   ```javascript
   // Test API call from console
   fetch('http://localhost:3000/user/me', {
     credentials: 'include'
   }).then(r => r.json()).then(console.log)
   ```

### Using Postman/Thunder Client

1. **Set Base URL**
   - `http://localhost:3000`

2. **Authentication**
   - Get session cookie from browser
   - Add to Postman cookie jar
   - Or copy from Network tab

3. **Test Endpoints**
   - GET /user/me
   - POST /books
   - PATCH /books/:id

---

## Caching & Optimization

### Simple Cache Implementation

```typescript
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function cachedFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  // Check cache
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }

  // Fetch from API
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
  });

  const data = await response.json();

  // Cache result
  cache.set(url, { data, timestamp: Date.now() });

  return data;
}
```

### Use in Components

```typescript
useEffect(() => {
  const fetchBooks = async () => {
    try {
      const books = await cachedFetch('/books');
      setBooks(books);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  fetchBooks();
}, []);
```

---

## Debugging API Issues

### Common Problems

#### CORS Errors
**Problem:** `Access to XMLHttpRequest blocked by CORS policy`
**Solution:**
- Verify backend CORS config
- Ensure `credentials: 'include'` is set
- Check backend allows `http://localhost:5173`

#### 401 Unauthorized
**Problem:** `Unauthorized` response
**Solution:**
- Verify user is logged in
- Check session cookie exists
- Try refreshing session: `Session.attemptRefreshingSession()`

#### 404 Not Found
**Problem:** `Cannot find resource`
**Solution:**
- Verify endpoint URL is correct
- Check API server is running
- Verify resource ID exists

#### Network Error
**Problem:** `Failed to fetch`
**Solution:**
- Verify backend is running on `:3000`
- Check firewall/network connectivity
- Verify Docker containers are running

### Debug Logging

```typescript
async function debugFetch(url: string, options?: RequestInit) {
  console.group('API Call');
  console.log('URL:', url);
  console.log('Options:', options);

  const response = await fetch(url, {
    credentials: 'include',
    ...options,
  });

  console.log('Status:', response.status);
  console.log('Headers:', response.headers);

  const data = await response.json();
  console.log('Response:', data);
  console.groupEnd();

  return data;
}
```

---

## Best Practices

1. **Always include credentials**
   ```typescript
   fetch(url, { credentials: 'include' })
   ```

2. **Check response status**
   ```typescript
   if (!response.ok) throw new Error('API Error');
   ```

3. **Set proper headers**
   ```typescript
   headers: { 'Content-Type': 'application/json' }
   ```

4. **Handle loading states**
   ```typescript
   const [loading, setLoading] = useState(true);
   // ... fetch ...
   finally { setLoading(false); }
   ```

5. **Error boundaries**
   ```typescript
   try { /* ... */ } catch (error) { /* handle error */ }
   ```

6. **Debounce frequent requests**
   ```typescript
   const timer = setTimeout(() => fetch(), 300);
   return () => clearTimeout(timer);
   ```

7. **Reuse API functions**
   - Don't duplicate fetch logic
   - Create helper functions
   - Use custom hooks for data fetching

---

**Last Updated:** February 2026
