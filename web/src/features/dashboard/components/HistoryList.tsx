"use client";

import { useState } from "react";
import { HistoryItem } from "../types/history.types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";

export default function HistoryList({ data }: { data: HistoryItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = data.filter((item) =>
    item.text.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search posts..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filtered.length === 0 && (
        <p className="text-slate-400 text-sm">No results found</p>
      )}

      {filtered.map((item) => (
        <Card key={item.id} className="space-y-2">
          <p className="text-sm text-slate-300 line-clamp-2">
            {item.text}
          </p>

          <div className="flex justify-between items-center">
            <Badge>{item.prediction}</Badge>
            <span className="text-xs text-slate-500">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}