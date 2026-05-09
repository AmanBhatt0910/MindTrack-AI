"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { UserRole } from "@/types/auth.types";

export function useRequireAuth(allowedRoles?: UserRole[]) {
  const router = useRouter();
  const { user, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated) {
      if (!user) {
        router.push("/login");
      } else if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard if role is not allowed
        router.push(user.role === "doctor" || user.role === "admin" ? "/doctor" : "/mood");
      }
    }
  }, [hasHydrated, user, router, allowedRoles]);

  return user;
}