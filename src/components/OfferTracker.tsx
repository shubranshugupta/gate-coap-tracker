"use client";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import EntryForm from "./EntryForm";
import DashboardTable from "./DashboardTable";
import AnalyticsPanel from "./analytics/AnalyticsPanel";
import { useSubmissionCount } from "@/hooks/useSubmissionCount";

const accentMap = {
  cyan: "stat-card-cyan",
  violet: "stat-card-violet",
  green: "stat-card-green",
  amber: "stat-card-amber",
};
const valueColors = {
  cyan: "var(--color-accent)",
  violet: "var(--color-violet)",
  green: "var(--color-success)",
  amber: "var(--color-warning)",
};

export default function OfferTracker() {
  const submissionCount = useSubmissionCount();
  const stats = [
    {
      label: "Total Submissions",
      value: submissionCount !== null ? submissionCount : "—",
      sub: "live from Firestore",
      accent: "cyan" as const,
      icon: "📊",
    },
    {
      label: "Institutes",
      value: "24",
      sub: "IITs + IISc",
      accent: "violet" as const,
      icon: "🏛️",
    },
    {
      label: "Program Types",
      value: "4",
      sub: "Mtech · MS · RA variants",
      accent: "green" as const,
      icon: "🎯",
    },
    {
      label: "Categories",
      value: "6",
      sub: "General · EWS · OBC · SC · ST · PwD",
      accent: "amber" as const,
      icon: "🗂️",
    },
  ];
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-bg-base)" }}
    >
      <Header />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-8">
        {/* ── Hero ── */}
        <section
          className="relative rounded-2xl overflow-hidden animate-fade-in-up"
          style={{ padding: "3rem 2rem" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
              radial-gradient(ellipse 60% 50% at 10% 50%, var(--color-accent-muted) 0%, transparent 70%),
              radial-gradient(ellipse 50% 60% at 90% 30%, var(--color-violet-muted) 0%, transparent 70%)
            `,
            }}
          />
          <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ border: "1px solid var(--color-border-bright)" }}
          />
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="live-dot" />
              <span
                className="text-xs tracking-widest uppercase"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-accent)",
                }}
              >
                Real-Time · Community Driven
              </span>
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold leading-tight mb-4"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              Track COAP Offers{" "}
              <span className="shimmer-text">in Real-Time</span>
            </h1>
            <p
              className="text-base leading-relaxed mb-6 max-w-lg"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Anonymously report your M.Tech &amp; MS offers from IITs and IISc.
              Help the GATE CSE community see live cut-off trends across all
              COAP rounds.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Anonymous",
                "No Login Required",
                "Instant Updates",
                "Free Forever",
              ].map((tag) => (
                <span
                  key={tag}
                  className="badge"
                  style={{
                    background: "var(--color-bg-elevated)",
                    border: "1px solid var(--color-border-bright)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up animate-delay-100">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`stat-card ${accentMap[stat.accent]}`}
            >
              <div className="text-xl mb-2">{stat.icon}</div>
              <div
                className="text-2xl font-bold mb-0.5"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: valueColors[stat.accent],
                }}
              >
                {stat.value}
              </div>
              <div
                className="text-sm font-semibold"
                style={{
                  color: "var(--color-text-primary)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {stat.label}
              </div>
              <div
                className="text-xs mt-1"
                style={{
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {stat.sub}
              </div>
            </div>
          ))}
        </section>

        {/* ── Entry Form ── */}
        <section className="animate-fade-in-up animate-delay-200">
          <EntryForm />
        </section>

        {/* ── Analytics Panel ── */}
        <section className="animate-fade-in-up animate-delay-300">
          <AnalyticsPanel filterInstitute="All" filterCategory="All" />
        </section>

        {/* ── Dashboard Table ── */}
        <section className="animate-fade-in-up animate-delay-400">
          <DashboardTable />
        </section>
      </main>

      <Footer />
    </div>
  );
}
