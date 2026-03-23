"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Depression", value: 5 },
  { name: "Anxiety", value: 3 },
  { name: "Neutral", value: 10 },
];

export default function AnalysisChart() {
  return (
    <div className="w-full h-[300px] min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" outerRadius={80}>
            {data.map((_, i) => (
              <Cell key={i} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}