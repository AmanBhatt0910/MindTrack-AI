"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import DashboardLayout from "@/layouts/DashboardLayout";

export default function DashboardPage() {
  const user = useRequireAuth();

  if (!user) return null;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">Welcome {user.email}</h1>
    </DashboardLayout>
  );
}