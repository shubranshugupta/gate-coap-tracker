export default function Footer() {
  return (
    <footer
      className="mt-16 border-t"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="live-dot" style={{ width: "6px", height: "6px" }} />
          <span
            className="text-xs"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
            }}
          >
            GATE CSE COAP TRACKER · 2025
          </span>
        </div>
        <p
          className="text-xs text-center"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          Community-driven · Anonymous · Not affiliated with IITs or COAP
        </p>
      </div>
    </footer>
  );
}
