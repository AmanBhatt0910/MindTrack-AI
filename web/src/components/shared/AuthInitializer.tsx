"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/features/auth/services/auth.service";
import { Loader2 } from "lucide-react";

/**
 * AuthInitializer - Handles authentication on app startup
 * - Restores user from localStorage
 * - Validates token
 * - Redirects based on auth state
 */
export default function AuthInitializer() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, hasHydrated, setAuth, logout } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Wait for zustand to hydrate first
    if (!hasHydrated) {
      return;
    }

    const initializeAuth = async () => {
      try {
        // If user is already authenticated
        if (user && token) {
          setIsHydrated(true);
          setIsInitializing(false);
          return;
        }

        // Check if there's a token in localStorage (for page refresh)
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
          // No token - check if on login/signup page, if not redirect to login
          setIsHydrated(true);
          setIsInitializing(false);
          
          if (!["/login", "/signup", "/forgot-password"].includes(pathname)) {
            router.push("/login");
          }
          return;
        }

        // Token exists but not in memory - validate and restore
        try {
          // Try to validate the token by calling a protected endpoint
          const response = await authService.validateToken(storedToken);
          
          if (response && response.user) {
            // Token is valid - restore auth
            setAuth(response.user, storedToken);
            setIsHydrated(true);
            setIsInitializing(false);
            
            // Redirect to dashboard if on auth pages
            if (["/login", "/signup", "/forgot-password"].includes(pathname)) {
              const dashboardPath = 
                response.user.role === "doctor" || response.user.role === "admin" 
                  ? "/doctor" 
                  : "/dashboard";
              router.push(dashboardPath);
            }
            return;
          }
        } catch (tokenError) {
          // Token validation failed - clear it
          localStorage.removeItem("token");
          logout();
          setIsHydrated(true);
          setIsInitializing(false);
          
          if (!["/login", "/signup", "/forgot-password"].includes(pathname)) {
            router.push("/login");
          }
          return;
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("token");
        logout();
        setIsHydrated(true);
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [hasHydrated, user, token, pathname, router, setAuth, logout]);

  // Show loading state only during initial auth check
  if (!isHydrated || isInitializing) {
    return (
      <div className="fixed inset-0 bg-[var(--surface)] flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
          <p className="text-sm text-[var(--text-muted)]">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return null;
}
