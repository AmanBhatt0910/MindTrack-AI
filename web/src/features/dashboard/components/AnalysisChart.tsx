"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { HistoryItem } from "../types/history.types";

interface AnalysisChartProps {
  history: HistoryItem[];
}

const COLORS: Record<string, string> = {
  Anxiety: "#eab308",
  Depression: "#8b5cf6",
  Stress: "#f97316",
  Bipolar: "#ec4899",
  Neutral: "#22c55e",
};

// Custom label renderer for Pie chart
const renderCustomLabel = (entry: { name?: string; percent?: number }) => {
  const { name, percent } = entry;
  if (!name || percent === undefined) return null;
  return `${name} (${(percent * 100).toFixed(0)}%)`;
};

export default function AnalysisChart({ history }: AnalysisChartProps) {
  // Use useMemo for derived data
  const { chartData, pieData } = useMemo(() => {
    // Count occurrences of each prediction
    const counts: Record<string, number> = {};
    history.forEach((item) => {
      counts[item.prediction] = (counts[item.prediction] || 0) + 1;
    });

    const barData = Object.entries(counts).map(([name, count]) => ({ name, count }));
    const pieChartData = Object.entries(counts).map(([name, value]) => ({ name, value }));
    
    return { chartData: barData, pieData: pieChartData };
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
        <p className="text-sm text-[var(--text-muted)]">No data available yet. Analyze some posts to see charts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="size-1.5 rounded-full bg-(--accent) pulse-dot" aria-hidden />
        <h2 className="text-sm font-semibold text-(--text) tracking-[-0.01em]">
          Analysis Overview
        </h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Bar Chart */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="text-sm font-medium text-[var(--text)] mb-4">Detection Frequency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--text)",
                }}
                formatter={(value, name) => {
                  // Type guard to ensure value is a number
                  const count = typeof value === 'number' ? value : 0;
                  return [`${count} times`, name];
                }}
              />
              <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name] || "var(--accent)"} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="text-sm font-medium text-[var(--text)] mb-4">Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name] || "var(--accent)"} 
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--text)",
                }}
                formatter={(value, name) => {
                  // Type guard to ensure value is a number
                  const count = typeof value === 'number' ? value : 0;
                  return [`${count} times`, name];
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}