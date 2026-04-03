"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "coap_flagged_offers";

function getFlaggedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set<string>(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveFlaggedSet(set: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // localStorage might be unavailable
  }
}

export interface UseFlagReturn {
  isFlagged: (id: string) => boolean;
  flagOffer: (id: string) => Promise<{ hidden: boolean } | null>;
  isSubmitting: boolean;
}

export function useFlag(): UseFlagReturn {
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hydrate from localStorage once mounted
  useEffect(() => {
    setFlagged(getFlaggedSet());
  }, []);

  const isFlagged = useCallback((id: string) => flagged.has(id), [flagged]);

  const flagOffer = useCallback(
    async (id: string) => {
      if (flagged.has(id) || isSubmitting) return null;

      setIsSubmitting(true);
      try {
        const res = await fetch("/api/flag-offer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offerId: id }),
        });

        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? "Failed to flag offer.");
        }

        const data = (await res.json()) as {
          hidden: boolean;
          newCount: number;
        };

        // Persist to localStorage
        const next = new Set(flagged);
        next.add(id);
        setFlagged(next);
        saveFlaggedSet(next);

        return { hidden: data.hidden };
      } catch (err) {
        console.error("[useFlag]", err);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [flagged, isSubmitting],
  );

  return { isFlagged, flagOffer, isSubmitting };
}
