# Favorites Feature - Debug Guide

## What I've Fixed

### 1. Backend - User Profile Data (`/user/me`)
**File:** `apps/backend/src/user/user.service.ts`
- Now includes `favoriteBooks`, `favoriteAuthors`, `ratings`, `comments`, and `haveReadIt` in the response
- Previously these were not being returned, so the profile page showed 0 items

### 2. Frontend - API Error Logging
**File:** `apps/web/src/context/apiContext.tsx`
- Added detailed console logging for all favorite/unfavorite requests
- Shows the exact endpoint being called and the full response/error
- This will help identify what's failing

### 3. Frontend - Component Error Handling
**Files:** 
- `apps/web/src/components/BookDetails.tsx`
- `apps/web/src/components/AuthorDetails.tsx`
- Added console logs to show the favorite state and what action is being taken
- Error alerts now show the actual error message

## How to Debug

### Step 1: Open Browser Console
1. Press `F12` to open Developer Tools
2. Click the "Console" tab
3. Go to a book or author details page and try to add to favorites
4. Look for console messages like:
   - `Calling: http://localhost:3002/social/book/[bookId]/like`
   - `Response status: 200` (or error status)
   - Any error messages

### Step 2: Check What The Error Is
The console will show:
- If the endpoint is being called
- What response the server returns
- If there's a network error
- If it's a 401 (not authenticated), 403 (forbidden), 404 (not found), or 500 (server error)

### Step 3: Check If User Is Logged In
Make sure:
- You can navigate to `/user/me` and see your profile
- You're logged in with a valid session
- The session cookie is being sent (should be automatic with `credentials: "include"`)

## Expected Flow

1. **Click "Add to Favorites" button**
   - Console: `Current favorite state: false`
   - Console: `Liking book...`

2. **API Call Made**
   - Console: `Calling: http://localhost:3002/social/book/[bookId]/like`
   - Console: `Response status: 200`
   - Console: `Success!`

3. **Button Changes**
   - Button text changes to "❤️ Remove from Favorites"
   - Button color changes to red

4. **Profile Shows Favorite**
   - Go to `/user/me` profile page
   - Click "Refresh" button on profile
   - Favorite should appear under "Favorite Books"

## Common Issues & Solutions

### Issue: "Failed to update favorite: Failed to like book"
**Cause:** User is not authenticated or session expired
**Solution:** Log out and log back in

### Issue: Response status 401 or 403
**Cause:** Session guard is rejecting the request
**Solution:** Check if you're actually logged in

### Issue: Response status 500
**Cause:** Server error - likely the user or book doesn't exist in database
**Solution:** Check backend logs and make sure you're using valid book/author IDs

### Issue: No console messages appear
**Cause:** The click handler isn't being called
**Solution:** Make sure you're clicking the actual button, check if button is disabled

## Backend Service Methods

The backend expects the `userId` parameter to be an **email address** (because User.id = email in the database):
- `POST /social/book/:bookId/like` → calls `likingBook(bookId, email)`
- `PATCH /social/book/:bookId/unlike` → calls `unlikingBook(bookId, email)`
- `POST /social/authors/:authorId/like` → calls `likeAuthor(authorId, email)`
- `PATCH /social/authors/:authorId/unlike` → calls `unlikeAuthor(authorId, email)`

All requests must include `credentials: "include"` to send the session cookie.
