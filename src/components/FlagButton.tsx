"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useFlag } from "@/hooks/useFalg";

const FlagIcon = ({ filled }: { filled: boolean }) => (
  <svg
    className="w-3.5 h-3.5 transition-all duration-200"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 2H21l-3 6 3 6h-8.5l-1-2H5a2 2 0 00-2 2z"
    />
  </svg>
);

interface FlagButtonProps {
  offerId: string;
}

export default function FlagButton({ offerId }: FlagButtonProps) {
  const { isFlagged, flagOffer } = useFlag();
  const [localHidden, setLocalHidden] = useState(false);
  const [loading, setLoading] = useState(false);

  const already = isFlagged(offerId);

  if (localHidden) return null;

  const handleFlag = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (already || loading) return;

    // Optimistic confirm dialog
    const confirmed = window.confirm(
      "Flag this offer as incorrect or fake?\n\nOffers flagged 5 times will be hidden from the dashboard.",
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const result = await flagOffer(offerId);
      if (result?.hidden) {
        toast.success("Offer flagged and hidden from dashboard.");
        setLocalHidden(true);
      } else {
        toast.success("Offer flagged. Thank you for helping keep data clean.");
      }
    } catch {
      toast.error("Could not submit flag. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFlag}
      disabled={already || loading}
      aria-label={
        already ? "Already flagged" : "Flag this offer as fake or incorrect"
      }
      title={
        already
          ? "You already flagged this offer"
          : "Report as fake / incorrect"
      }
      className="group flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200"
      style={{
        background: already ? "var(--color-danger-muted)" : "transparent",
        border: `1px solid ${already ? "rgba(248,113,113,0.25)" : "transparent"}`,
        color: already ? "var(--color-danger)" : "var(--color-text-muted)",
        cursor: already ? "default" : loading ? "wait" : "pointer",
        opacity: loading ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!already && !loading) {
          (e.currentTarget as HTMLElement).style.background =
            "var(--color-danger-muted)";
          (e.currentTarget as HTMLElement).style.borderColor =
            "rgba(248,113,113,0.25)";
          (e.currentTarget as HTMLElement).style.color = "var(--color-danger)";
        }
      }}
      onMouseLeave={(e) => {
        if (!already) {
          (e.currentTarget as HTMLElement).style.background = "transparent";
          (e.currentTarget as HTMLElement).style.borderColor = "transparent";
          (e.currentTarget as HTMLElement).style.color =
            "var(--color-text-muted)";
        }
      }}
    >
      {loading ? (
        <svg
          className="animate-spin w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
        >
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
      ) : (
        <FlagIcon filled={already} />
      )}
    </button>
  );
}
