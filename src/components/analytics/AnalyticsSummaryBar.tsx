interface Props {
  totalOffers: number;
  institutesCount: number;
  topInstitute: string;
  topRound: string;
}

export default function AnalyticsSummaryBar({
  totalOffers,
  institutesCount,
  topInstitute,
  topRound,
}: Props) {
  const stats = [
    {
      label: "Total Analysed",
      value: totalOffers.toLocaleString(),
      color: "var(--color-accent)",
    },
    {
      label: "Institutes",
      value: String(institutesCount),
      color: "var(--color-violet)",
    },
    {
      label: "Most Offers From",
      value: topInstitute || "—",
      color: "var(--color-success)",
    },
    {
      label: "Busiest Round",
      value: topRound || "—",
      color: "var(--color-warning)",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl px-4 py-3"
          style={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            className="text-lg font-bold truncate"
            style={{ fontFamily: "var(--font-mono)", color: s.color }}
          >
            {s.value}
          </div>
          <div
            className="text-[10px] mt-0.5 tracking-wide uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
            }}
          >
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
