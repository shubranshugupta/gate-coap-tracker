"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

interface RoundData {
  round: string;
  count: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
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
        className="font-bold mb-1.5"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-text-primary)",
        }}
      >
        {label?.replace("R", "Round ")}
      </p>
      <div className="flex items-center gap-2">
        <span style={{ color: "var(--color-text-muted)" }}>Offers</span>
        <span
          className="font-semibold"
          style={{ color: "var(--color-violet)" }}
        >
          {payload[0].value}
        </span>
      </div>
    </div>
  );
};

interface Props {
  data: RoundData[];
}

export default function OffersPerRoundChart({ data }: Props) {
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
      <BarChart
        data={data}
        margin={{ top: 24, right: 8, left: -16, bottom: 8 }}
        barSize={32}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border)"
          vertical={false}
        />
        <XAxis
          dataKey="round"
          tick={{
            fill: "var(--color-text-secondary)",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            fontWeight: 500,
          }}
          axisLine={{ stroke: "var(--color-border)" }}
          tickLine={false}
        />
        <YAxis
          tick={{
            fill: "var(--color-text-muted)",
            fontSize: 10,
            fontFamily: "var(--font-mono)",
          }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "var(--color-violet-muted)", radius: 4 }}
        />
        <Bar
          dataKey="count"
          fill="var(--color-violet)"
          radius={[6, 6, 0, 0]}
          opacity={0.85}
        >
          <LabelList
            dataKey="count"
            position="top"
            style={{
              fill: "var(--color-text-secondary)",
              fontSize: 10,
              fontFamily: "var(--font-mono)",
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
