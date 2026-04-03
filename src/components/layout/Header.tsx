"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const SunIcon = () => (
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
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const MoonIcon = () => (
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
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

const GraduationIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 14l9-5-9-5-9 5 9 5z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
    />
  </svg>
);

interface HeaderProps {
  totalOffers?: number;
}

export default function Header({ totalOffers = 0 }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — only render theme-dependent UI after mount
  useEffect(() => setMounted(true), []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header
      className="sticky top-0 z-50 animate-fade-in-down"
      style={{
        background: "color-mix(in srgb, var(--color-bg-base) 80%, transparent)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        {/* ── Logo ── */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: "var(--color-accent-muted)",
              border: "1px solid var(--color-accent-dim)",
              color: "var(--color-accent)",
            }}
          >
            <GraduationIcon />
          </div>
          <div className="leading-tight">
            <div
              className="text-sm font-bold tracking-wide"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              GATE COAP
            </div>
            <div
              className="text-[10px] tracking-widest uppercase"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-accent)",
              }}
            >
              Tracker
            </div>
          </div>
        </div>

        {/* ── Live Indicator (center) ── */}
        <div className="hidden sm:flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: "var(--color-accent-muted)",
              border: "1px solid rgba(34,211,238,0.15)",
            }}
          >
            <div className="live-dot" />
            <span
              className="text-xs font-medium"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-accent)",
              }}
            >
              LIVE
            </span>
          </div>

          {totalOffers > 0 && (
            <span
              className="text-xs"
              style={{
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {totalOffers.toLocaleString()} offers tracked
            </span>
          )}
        </div>

        {/* ── Right Controls ── */}
        <div className="flex items-center gap-2">
          {/* COAP 2025 badge */}
          <span className="hidden md:inline-flex badge badge-warn">
            COAP 2026
          </span>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-secondary)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "var(--color-accent-dim)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--color-accent)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "var(--color-border)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--color-text-secondary)";
            }}
          >
            {/* Render placeholder until mounted to avoid flash */}
            {!mounted ? (
              <div
                className="w-4 h-4 rounded"
                style={{ background: "var(--color-border)" }}
              />
            ) : theme === "dark" ? (
              <SunIcon />
            ) : (
              <MoonIcon />
            )}
          </button>
        </div>
      </div>

      {/* Glow line at bottom of header */}
      <div className="glow-divider" />
    </header>
  );
}
