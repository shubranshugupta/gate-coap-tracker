"use client";

import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { exportCSV, exportExcel } from "@/utils/exportData";
import type { Offer } from "@/types";

const DownloadIcon = () => (
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
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

const ChevronIcon = () => (
  <svg
    className="w-3 h-3"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const CSVIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0120 9.414V19a2 2 0 01-2 2z"
    />
  </svg>
);

const ExcelIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

interface ExportMenuProps {
  offers: Offer[];
  filterInstitute: string;
  filterCategory: string;
  disabled?: boolean;
}

const EXPORT_OPTIONS = [
  {
    format: "csv" as const,
    label: "Download as CSV",
    sub: "Universal · spreadsheet-ready",
    color: "var(--color-success)",
    icon: <CSVIcon />,
  },
  {
    format: "xlsx" as const,
    label: "Download as Excel",
    sub: "Formatted · .xlsx workbook",
    color: "var(--color-accent)",
    icon: <ExcelIcon />,
  },
] as const;

export default function ExportMenu({
  offers,
  filterInstitute,
  filterCategory,
  disabled = false,
}: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<"csv" | "xlsx" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleExport = async (format: "csv" | "xlsx") => {
    if (offers.length === 0) {
      toast.error("No data to export.");
      setOpen(false);
      return;
    }

    setLoading(format);
    setOpen(false);

    // Small delay so loading state renders before the sync export blocks the thread
    await new Promise((r) => setTimeout(r, 80));

    try {
      if (format === "csv") {
        exportCSV(offers, filterInstitute, filterCategory);
        toast.success(`Exported ${offers.length} offers as CSV`);
      } else {
        exportExcel(offers, filterInstitute, filterCategory);
        toast.success(`Exported ${offers.length} offers as Excel`);
      }
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Export failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const isDisabled = disabled || offers.length === 0;

  return (
    <div className="relative" ref={menuRef}>
      {/* ── Trigger Button ── */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        disabled={isDisabled}
        className="btn-ghost flex items-center gap-2 px-3 py-2 text-xs"
        aria-haspopup="true"
        aria-expanded={open}
        title={
          isDisabled ? "No data to export" : `Export ${offers.length} offers`
        }
      >
        {loading ? <SpinnerIcon /> : <DownloadIcon />}
        <span style={{ fontFamily: "var(--font-mono)" }}>
          {loading ? `Exporting ${loading.toUpperCase()}…` : "Export"}
        </span>
        {!loading && <ChevronIcon />}
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden z-50 animate-fade-in-down"
          style={{
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-bright)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-2.5 border-b"
            style={{ borderColor: "var(--color-border)" }}
          >
            <p
              className="text-[10px] font-semibold tracking-widest uppercase"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-muted)",
              }}
            >
              Export {offers.length} offer{offers.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Options */}
          {EXPORT_OPTIONS.map((item) => (
            <button
              key={item.format}
              onClick={() => handleExport(item.format)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
              style={{ background: "transparent" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "var(--color-bg-hover)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "transparent")
              }
            >
              <span
                className="mt-0.5 flex-shrink-0"
                style={{ color: item.color }}
              >
                {item.icon}
              </span>
              <div>
                <p
                  className="text-sm font-medium"
                  style={{
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {item.label}
                </p>
                <p
                  className="text-[10px] mt-0.5"
                  style={{
                    color: "var(--color-text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {item.sub}
                </p>
              </div>
            </button>
          ))}

          {/* Footer */}
          <div
            className="px-4 py-2.5 border-t"
            style={{ borderColor: "var(--color-border)" }}
          >
            <p
              className="text-[10px]"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-muted)",
              }}
            >
              Exports currently loaded + filtered data
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
