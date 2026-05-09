"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * useAuthRedirect - Handles redirects based on auth state
 * Used on pages like login, signup to redirect if already authenticated
 */
export function useAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && user) {
      // User is authenticated - redirect to dashboard
      const redirectPath =
        user.role === "doctor" || user.role === "admin" 
          ? "/doctor" 
          : "/dashboard";
      
      router.replace(redirectPath);
    }
  }, [hasHydrated, user, router]);

  // Return loading state - component shouldn't render while redirecting
  if (hasHydrated && user) {
    return { isRedirecting: true };
  }

  return { isRedirecting: false };
}
