"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CatData {
  category: string;
  count: number;
}
import type { Props as LegendProps } from "recharts/types/component/DefaultLegendContent";
const PALETTE = [
  "var(--color-accent)",
  "var(--color-violet)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-danger)",
  "#a78bfa",
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; payload: CatData }[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  const total = payload[0].payload.count;
  return (
    <div
      className="rounded-xl p-3 text-xs"
      style={{
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-bright)",
        fontFamily: "var(--font-mono)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      <p
        className="font-bold mb-1"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-text-primary)",
        }}
      >
        {payload[0].name}
      </p>
      <p style={{ color: "var(--color-text-secondary)" }}>{total} offers</p>
    </div>
  );
};

// Custom legend
const renderLegend = (props: LegendProps) => {
  const { payload = [] } = props;
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: entry.color ?? "#888" }}
          />
          <span
            className="text-[10px]"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-secondary)",
            }}
          >
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

interface Props {
  data: CatData[];
}

export default function CategoryBreakdownChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p
          className="text-sm"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-text-muted)",
          }}
        >
          No data available
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="count"
          nameKey="category"
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell
              key={`cell-${i}`}
              fill={PALETTE[i % PALETTE.length]}
              opacity={0.88}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={renderLegend} />
      </PieChart>
    </ResponsiveContainer>
  );
}
