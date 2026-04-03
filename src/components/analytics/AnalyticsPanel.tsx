"use client";

import { useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import ChartCard from "./ChartCard";
import ScoreByInstituteChart from "./ScoreByInstituteChart";
import OffersPerRoundChart from "./OffersPerRoundChart";
import CategoryBreakdownChart from "./CategoryBreakdownChart";
import AnalyticsSummaryBar from "./AnalyticsSummaryBar";

/* ── Icons ──────────────────────────────────────────────── */
const BarChartIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    className="w-4 h-4 transition-transform duration-300"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const RefreshIcon = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

const RoundIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
    />
  </svg>
);

const PieChartIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
    />
  </svg>
);

/* ── Skeleton ────────────────────────────────────────────── */
const ChartSkeleton = () => (
  <div className="flex flex-col gap-3 h-64 justify-end px-2">
    {[40, 70, 55, 85, 45, 60, 90, 35].map((h, i) => (
      <div key={i} style={{ height: `${h}%` }}>
        <div className="skeleton w-full h-full rounded-t-md" />
      </div>
    ))}
  </div>
);

/* ── Error Banner ────────────────────────────────────────── */
const ErrorBanner = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div
    className="flex items-center justify-between gap-4 p-4 rounded-xl"
    style={{
      background: "var(--color-danger-muted)",
      border: "1px solid rgba(248,113,113,0.25)",
    }}
  >
    <p className="text-sm" style={{ color: "var(--color-danger)" }}>
      {message}
    </p>
    <button
      onClick={onRetry}
      className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 text-xs"
    >
      <RefreshIcon /> Retry
    </button>
  </div>
);

/* ── Main Component ──────────────────────────────────────── */
interface Props {
  filterInstitute: string;
  filterCategory: string;
}

export default function AnalyticsPanel({
  filterInstitute,
  filterCategory,
}: Props) {
  const [open, setOpen] = useState(false);
  const { data, loading, error, refetch } = useAnalytics(
    filterInstitute,
    filterCategory,
  );

  const topInstitute = data?.scoreByInstitute[0]?.institute ?? "—";
  const topRound =
    data?.offersPerRound
      .reduce((best, r) => (r.count > best.count ? r : best), {
        round: "—",
        count: 0,
      })
      .round.replace("R", "Round ") ?? "—";

  return (
    <div className="card overflow-hidden">
      {/* ── Toggle Header ── */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-5 md:p-6 transition-colors"
        style={{ background: "transparent" }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.background =
            "var(--color-bg-elevated)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.background = "transparent")
        }
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: "var(--color-accent-muted)",
              border: "1px solid var(--color-accent-dim)",
              color: "var(--color-accent)",
            }}
          >
            <BarChartIcon />
          </div>
          <div className="text-left">
            <h2
              className="text-lg font-bold"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              Analytics
            </h2>
            <p
              className="text-xs"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-muted)",
              }}
            >
              {open
                ? "click to collapse"
                : `visualize cut-off trends${data ? ` · ${data.totalOffers} offers` : ""}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!open && data && (
            <span className="hidden sm:inline-flex badge badge-round">
              {data.totalOffers} offers
            </span>
          )}
          <span style={{ color: "var(--color-text-muted)" }}>
            <ChevronIcon open={open} />
          </span>
        </div>
      </button>

      {/* ── Collapsible Content ── */}
      {open && (
        <div
          className="border-t animate-fade-in-up"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="p-5 md:p-6 space-y-6">
            {/* Error */}
            {error && <ErrorBanner message={error} onRetry={refetch} />}

            {/* Summary bar */}
            {!loading && !error && data && (
              <AnalyticsSummaryBar
                totalOffers={data.totalOffers}
                institutesCount={data.scoreByInstitute.length}
                topInstitute={topInstitute}
                topRound={topRound}
              />
            )}

            {/* Charts grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Lowest Score by Institute */}
              <ChartCard
                title="Lowest Score by Institute"
                subtitle="min GATE score that received an offer"
                icon={<BarChartIcon />}
                accentColor="var(--color-accent)"
              >
                {loading ? (
                  <ChartSkeleton />
                ) : (
                  <ScoreByInstituteChart data={data?.scoreByInstitute ?? []} />
                )}
              </ChartCard>

              {/* Offers per Round */}
              <ChartCard
                title="Offers per Round"
                subtitle="number of reported offers per COAP round"
                icon={<RoundIcon />}
                accentColor="var(--color-violet)"
              >
                {loading ? (
                  <ChartSkeleton />
                ) : (
                  <OffersPerRoundChart data={data?.offersPerRound ?? []} />
                )}
              </ChartCard>

              {/* Category Breakdown */}
              <ChartCard
                title="Category Breakdown"
                subtitle="distribution of offers across reservation categories"
                icon={<PieChartIcon />}
                accentColor="var(--color-success)"
              >
                {loading ? (
                  <ChartSkeleton />
                ) : (
                  <CategoryBreakdownChart
                    data={data?.categoryBreakdown ?? []}
                  />
                )}
              </ChartCard>

              {/* Program Breakdown */}
              <ChartCard
                title="Program Breakdown"
                subtitle="Mtech vs MS vs RA variants"
                icon={<BarChartIcon />}
                accentColor="var(--color-warning)"
              >
                {loading ? (
                  <ChartSkeleton />
                ) : (
                  <OffersPerRoundChart
                    data={(data?.programBreakdown ?? []).map((p) => ({
                      round: p.program
                        .replace("Mtech", "MTech")
                        .replace("(RA/RAP/HVA)", " RA")
                        .replace("(RA/RAP)", " RA"),
                      count: p.count,
                    }))}
                  />
                )}
              </ChartCard>
            </div>

            {/* Footer note */}
            <p
              className="text-center text-xs"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-muted)",
              }}
            >
              Charts reflect all offers matching current filters ·{" "}
              <button
                onClick={refetch}
                className="underline underline-offset-2"
                style={{ color: "var(--color-accent)" }}
              >
                refresh data
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
