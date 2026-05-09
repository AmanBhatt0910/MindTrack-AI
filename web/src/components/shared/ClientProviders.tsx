"use client";

import SuggestionProvider from "@/features/suggestions/components/SuggestionProvider";
import AuthInitializer from "./AuthInitializer";
import { useAuthStore } from "@/store/useAuthStore";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();

  return (
    <>
      <AuthInitializer />
      {children}
      {/* Only run suggestion engine for authenticated users */}
      {user && <SuggestionProvider />}
    </>
  );
}
