"use client";

import SuggestionProvider from "@/features/suggestions/components/SuggestionProvider";
import { useAuthStore } from "@/store/useAuthStore";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();

  return (
    <>
      {children}
      {/* Only run suggestion engine for authenticated users */}
      {user && <SuggestionProvider />}
    </>
  );
}
