'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

interface ScoreData {
  institute: string;
  minScore:  number;
  avgScore:  number;
  maxScore:  number;
  count:     number;
}

interface CustomTooltipProps {
  active?:  boolean;
  payload?: { payload: ScoreData }[];
  label?:   string;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      className="rounded-xl p-3 text-xs space-y-1.5"
      style={{
        background:  'var(--color-bg-elevated)',
        border:      '1px solid var(--color-border-bright)',
        fontFamily:  'var(--font-mono)',
        boxShadow:   '0 8px 24px rgba(0,0,0,0.4)',
        minWidth:    '160px',
      }}
    >
      <p
        className="font-bold text-sm mb-2"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
      >
        {d.institute}
      </p>
      <div className="flex justify-between gap-4">
        <span style={{ color: 'var(--color-text-muted)' }}>Min Score</span>
        <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{d.minScore}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span style={{ color: 'var(--color-text-muted)' }}>Avg Score</span>
        <span style={{ color: 'var(--color-violet)' }}>{d.avgScore}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span style={{ color: 'var(--color-text-muted)' }}>Max Score</span>
        <span style={{ color: 'var(--color-success)' }}>{d.maxScore}</span>
      </div>
      <div
        className="flex justify-between gap-4 pt-1.5 border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span style={{ color: 'var(--color-text-muted)' }}>Submissions</span>
        <span style={{ color: 'var(--color-text-secondary)' }}>{d.count}</span>
      </div>
    </div>
  );
};

interface Props {
  data: ScoreData[];
}

export default function ScoreByInstituteChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p
          className="text-sm"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
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
        margin={{ top: 4, right: 8, left: -16, bottom: 60 }}
        barSize={18}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border)"
          vertical={false}
        />
        <XAxis
          dataKey="institute"
          tick={{
            fill:       'var(--color-text-muted)',
            fontSize:   10,
            fontFamily: 'var(--font-mono)',
          }}
          axisLine={{ stroke: 'var(--color-border)' }}
          tickLine={false}
          angle={-45}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tick={{
            fill:       'var(--color-text-muted)',
            fontSize:   10,
            fontFamily: 'var(--font-mono)',
          }}
          axisLine={false}
          tickLine={false}
          domain={['auto', 'auto']}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: 'var(--color-accent-muted)', radius: 4 }}
        />
        <Bar dataKey="minScore" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={`cell-${i}`}
              fill={`color-mix(in srgb, var(--color-accent) ${60 + (i % 3) * 10}%, var(--color-accent-dim))`}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}