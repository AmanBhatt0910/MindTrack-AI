# Authentication Workflow Fix - Complete Guide

## Overview
Fixed the authentication flow to automatically redirect logged-in users to their dashboard, eliminate repeated password entries, and properly manage token lifecycle.

## Problem Solved ✅

### Previous Issues:
1. ❌ Users with valid tokens had to manually navigate to dashboard
2. ❌ Typing `/login` with valid token would still show login form
3. ❌ No automatic session restoration on page refresh
4. ❌ Inconsistent token management across app lifecycle
5. ❌ Unclear logout process without proper cleanup

### Now Fixed:
1. ✅ Automatic redirect from login to dashboard if token exists
2. ✅ App startup checks for existing token and validates it
3. ✅ Session automatically restored on page refresh
4. ✅ Consistent token lifecycle management
5. ✅ Proper logout with complete cleanup

---

## Architecture Changes

### 1. **AuthInitializer Component** 
**File:** `src/components/shared/AuthInitializer.tsx`

Runs on app startup to:
- Check if Zustand store has hydrated from localStorage
- Validate stored token with backend
- Restore user session if valid
- Redirect based on auth state
- Clear invalid tokens

**When it runs:**
- Immediately after app loads
- Before any page renders
- Shows loading screen during auth check

**Key features:**
- Graceful error handling
- Token validation via API
- Automatic redirect to dashboard if authenticated
- Prevents accessing auth pages when logged in

### 2. **useAuthRedirect Hook**
**File:** `src/features/auth/hooks/useAuthRedirect.ts`

Used on auth pages (login, signup) to:
- Detect if user is already authenticated
- Redirect to appropriate dashboard
- Prevent showing form if redirecting

**Usage:**
```typescript
const { isRedirecting } = useAuthRedirect();
if (isRedirecting) return null; // Don't show form
```

### 3. **Token Validation Endpoint**
**File:** `src/app/api/auth/validate-token/route.ts`

Backend endpoint that:
- Accepts JWT token in Authorization header
- Verifies token is still valid
- Returns user data if valid
- Returns 401 if invalid/expired

**Request:**
```bash
POST /api/auth/validate-token
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "role": "..."
  },
  "token": "..."
}
```

### 4. **Enhanced Auth Service**
**File:** `src/features/auth/services/auth.service.ts`

Added methods:
- `validateToken(token)` - Validate existing token
- `logout()` - Call logout API endpoint

### 5. **Logout Endpoint**
**File:** `src/app/api/auth/logout/route.ts`

Backend endpoint for logout that:
- Verifies user is authenticated
- Logs logout event (optional)
- Frontend handles token cleanup

### 6. **Updated useAuth Hook**
**File:** `src/features/auth/hooks/useAuth.ts`

Now includes:
- `logout()` function with API call
- Proper cleanup of local state
- Redirect to login after logout
- Toast notifications

---

## User Flow Diagrams

### **Scenario 1: First Visit (No Token)**
```
User visits app
    ↓
AuthInitializer checks localStorage
    ↓
No token found
    ↓
User on login/signup page? YES → Show form
                            NO → Redirect to /login
```

### **Scenario 2: Visit with Valid Token (Refresh/Revisit)**
```
User visits app with valid token in localStorage
    ↓
AuthInitializer checks localStorage
    ↓
Token found → Call /api/auth/validate-token
    ↓
Token valid? YES → Restore user session
              NO → Clear token, show login
    ↓
User on login/signup? YES → Redirect to dashboard
                     NO → Continue normally
```

### **Scenario 3: Login Flow**
```
User submits login form
    ↓
Call POST /api/auth/login
    ↓
Success → Save token to localStorage
       → Store user in Zustand
       → Redirect to dashboard (/dashboard or /doctor)
       
Fail → Show error toast
    → Keep user on form
```

### **Scenario 4: Logout Flow**
```
User clicks logout
    ↓
Call POST /api/auth/logout
    ↓
Clear Zustand state
    ↓
Remove localStorage items
    ↓
Redirect to /login
```

### **Scenario 5: Token Expiration (After 7 days)**
```
User performs action with expired token
    ↓
API returns 401 (Unauthorized)
    ↓
Axios interceptor catches it
    ↓
Clear localStorage token
    ↓
Clear Zustand state
    ↓
Redirect to /login
    ↓
User sees "Session expired" message
```

---

## Key Implementation Details

### **Token Storage**
- **localStorage:** `token` - stores JWT
- **Zustand:** `user`, `token` - runtime state
- **Duration:** 7 days (set in backend JWT signing)

### **State Management**
```typescript
// Zustand store tracks:
- user: User | null
- token: string | null
- hasHydrated: boolean (zustand middleware)

// Methods:
- setAuth(user, token) - Set auth state
- logout() - Clear auth state
- isDoctor() - Check role
- isPatient() - Check role
```

### **Component Integration**
```typescript
// In ClientProviders (wraps entire app):
<AuthInitializer /> ← Runs on startup
{children}           ← Your app content
```

### **Login Page Protection**
```typescript
// In LoginForm component:
const { isRedirecting } = useAuthRedirect();
if (isRedirecting) return null; // Don't show form while redirecting
```

---

## Workflow Examples

### **Example 1: User Logs In**
```
1. User visits /login
2. AuthInitializer checks - no token, allows form
3. User enters credentials
4. LoginForm → useAuth.login()
5. API validates credentials
6. Token saved to localStorage
7. Zustand state updated
8. Redirect to /dashboard ✅
```

### **Example 2: User Refreshes Page (Still Authenticated)**
```
1. User refreshes /dashboard
2. AuthInitializer runs on app startup
3. Finds token in localStorage
4. Validates with /api/auth/validate-token
5. Token is valid ✅
6. Restores user to Zustand
7. Dashboard loads normally
8. User stays on /dashboard ✅
```

### **Example 3: User Types /login With Active Session**
```
1. User visits /login
2. AuthInitializer checks - finds valid token
3. Validates token - success
4. LoginForm component uses useAuthRedirect
5. isRedirecting = true → Form doesn't render
6. Redirects to /dashboard (or /doctor)
7. User never sees login form ✅
```

### **Example 4: Session Expires (7 days)**
```
1. User makes API call with old token
2. Backend returns 401 (token expired)
3. Axios interceptor catches 401
4. Clears localStorage
5. Clears Zustand state
6. Redirects to /login
7. User sees session expired toast
8. Must login again ✅
```

### **Example 5: User Logs Out**
```
1. User clicks logout button in sidebar
2. Calls useAuth.logout()
3. API call to /api/auth/logout
4. Zustand.logout() - clears state
5. localStorage token removed
6. Chat/mood/other stores cleared
7. Redirects to /login
8. All cleanup complete ✅
```

---

## Files Modified/Created

### **Created Files:**
1. `src/components/shared/AuthInitializer.tsx` - App startup auth check
2. `src/features/auth/hooks/useAuthRedirect.ts` - Login page redirect logic
3. `src/app/api/auth/validate-token/route.ts` - Token validation endpoint
4. `src/app/api/auth/logout/route.ts` - Logout endpoint

### **Modified Files:**
1. `src/components/shared/ClientProviders.tsx` - Added AuthInitializer
2. `src/features/auth/services/auth.service.ts` - Added validateToken, logout methods
3. `src/features/auth/components/LoginForm.tsx` - Added useAuthRedirect
4. `src/features/auth/hooks/useAuth.ts` - Added logout function, fixed redirect paths

---

## Testing Checklist

### **Test 1: Auto-Redirect on Login**
- [ ] Clear localStorage (DevTools)
- [ ] Visit /login
- [ ] Login with credentials
- [ ] Verify redirect to dashboard/doctor ✅

### **Test 2: Session Persistence**
- [ ] Login successfully
- [ ] Refresh page (Cmd+R)
- [ ] Verify session restored
- [ ] Check you're still logged in ✅

### **Test 3: Can't Access Login When Logged In**
- [ ] Login successfully
- [ ] Manually visit /login in address bar
- [ ] Verify automatic redirect to dashboard ✅

### **Test 4: Invalid Token Handling**
- [ ] Login successfully
- [ ] Open DevTools → Application → localStorage
- [ ] Manually corrupt the token
- [ ] Refresh page
- [ ] Verify redirected to /login ✅

### **Test 5: Logout**
- [ ] Login successfully
- [ ] Click logout button in sidebar
- [ ] Verify redirected to /login
- [ ] Check localStorage cleared
- [ ] Try to access /dashboard manually
- [ ] Verify redirected to /login ✅

### **Test 6: Role-Based Dashboard**
- [ ] Login as patient
- [ ] Verify redirected to /dashboard
- [ ] Login as doctor
- [ ] Verify redirected to /doctor ✅

---

## Configuration

### **Token Duration**
In `src/lib/auth.ts`:
```typescript
export const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" }); // Change here
};
```

### **Auth Pages**
List of pages that don't require auth (in `AuthInitializer`):
```typescript
if (!["/login", "/signup", "/forgot-password"].includes(pathname)) {
  // Redirect to login if not authenticated
}
```

### **Dashboard Paths by Role**
In `src/features/auth/hooks/useAuth.ts`:
```typescript
function getDashboardPath(role?: string): string {
  return role === "doctor" || role === "admin" ? "/doctor" : "/dashboard";
}
```

---

## Common Issues & Solutions

### **Issue: Always Showing Loading Screen**
**Solution:** Check if Zustand hydration is working
```typescript
// In AuthInitializer, verify hasHydrated changes to true
// Check browser console for errors
```

### **Issue: Token Not Being Saved**
**Solution:** Verify localStorage is enabled
```javascript
// In browser console:
localStorage.setItem("test", "value");
localStorage.getItem("test"); // Should return "value"
```

### **Issue: Redirect Not Working**
**Solution:** Verify router is available in client component
```typescript
"use client"; // Must be client component
const router = useRouter(); // from "next/navigation"
```

### **Issue: Expired Token Not Clearing**
**Solution:** Ensure API returns 401 and interceptor is set up
```typescript
// Check Axios interceptor in src/lib/axios.ts
// Should catch 401 and clear auth
```

---

## Performance Notes

✅ **Optimizations:**
- Auth check runs once on app startup
- Loading screen shown only during initial check
- No auth check on every page change
- Token validation cached in Zustand
- localStorage operations are fast

⚠️ **Potential Improvements:**
- Add token refresh mechanism (get new token before expiry)
- Implement "remember me" with longer expiry
- Add auth state persistence across tabs

---

## Security Notes

✅ **What's Secure:**
- Tokens stored in localStorage (accessible to JavaScript)
- 7-day expiration
- Token validation on every app startup
- Logout clears all sensitive data

⚠️ **Notes:**
- localStorage can be accessed by XSS attacks
- Consider httpOnly cookies for production
- Add CORS protection on sensitive endpoints
- Validate all tokens on backend

---

## Next Steps

1. **Test all scenarios** from the checklist above
2. **Monitor auth errors** in production
3. **Collect user feedback** on login experience
4. **Consider adding:**
   - "Remember me" checkbox
   - Biometric login
   - Social login (Google, GitHub)
   - Two-factor authentication

---

## Support

For questions or issues:
1. Check browser console for error messages
2. Review token validation in DevTools Network tab
3. Verify localStorage contains token after login
4. Check Zustand store state in React DevTools
5. Review auth flow diagrams above

