interface ChartCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accentColor?: string;
}

export default function ChartCard({
  title,
  subtitle,
  icon,
  children,
  accentColor = "var(--color-accent)",
}: ChartCardProps) {
  return (
    <div
      className="card p-5 md:p-6 flex flex-col gap-4"
      style={{ minHeight: "320px" }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{
            background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${accentColor} 30%, transparent)`,
            color: accentColor,
          }}
        >
          {icon}
        </div>
        <div>
          <h3
            className="text-base font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            {title}
          </h3>
          <p
            className="text-xs mt-0.5"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>

      {/* Chart area */}
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
