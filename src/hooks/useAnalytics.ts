"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type { Offer } from "@/types";

export interface AnalyticsData {
  scoreByInstitute: {
    institute: string;
    minScore: number;
    maxScore: number;
    avgScore: number;
    count: number;
  }[];
  offersPerRound: { round: string; count: number }[];
  categoryBreakdown: { category: string; count: number }[];
  programBreakdown: { program: string; count: number }[];
  totalOffers: number;
}

export interface UseAnalyticsReturn {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const EMPTY: AnalyticsData = {
  scoreByInstitute: [],
  offersPerRound: [],
  categoryBreakdown: [],
  programBreakdown: [],
  totalOffers: 0,
};

function computeAnalytics(offers: Offer[]): AnalyticsData {
  if (offers.length === 0) return EMPTY;

  /* ── Score by Institute ── */
  const instituteMap = new Map<string, number[]>();
  for (const o of offers) {
    if (!instituteMap.has(o.institute)) instituteMap.set(o.institute, []);
    instituteMap.get(o.institute)!.push(o.gateScore);
  }
  const scoreByInstitute = Array.from(instituteMap.entries())
    .map(([institute, scores]) => ({
      institute: institute.replace("IIT ", "").replace("IISc ", "IISc "),
      minScore: Math.min(...scores),
      maxScore: Math.max(...scores),
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      count: scores.length,
    }))
    .sort((a, b) => b.minScore - a.minScore)
    .slice(0, 15); // top 15 institutes by lowest score

  /* ── Offers per Round ── */
  const roundMap = new Map<string, number>();
  for (const o of offers) {
    roundMap.set(o.coapRound, (roundMap.get(o.coapRound) ?? 0) + 1);
  }
  const offersPerRound = Array.from(roundMap.entries())
    .map(([round, count]) => ({ round: round.replace("Round ", "R"), count }))
    .sort((a, b) => {
      // Sort R1, R2, ... numerically, Additional last
      const na = parseInt(a.round.replace("R", "")) || 99;
      const nb = parseInt(b.round.replace("R", "")) || 99;
      return na - nb;
    });

  /* ── Category Breakdown ── */
  const catMap = new Map<string, number>();
  for (const o of offers) {
    catMap.set(o.category, (catMap.get(o.category) ?? 0) + 1);
  }
  const categoryBreakdown = Array.from(catMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  /* ── Program Breakdown ── */
  const progMap = new Map<string, number>();
  for (const o of offers) {
    progMap.set(o.programType, (progMap.get(o.programType) ?? 0) + 1);
  }
  const programBreakdown = Array.from(progMap.entries())
    .map(([program, count]) => ({ program, count }))
    .sort((a, b) => b.count - a.count);

  return {
    scoreByInstitute,
    offersPerRound,
    categoryBreakdown,
    programBreakdown,
    totalOffers: offers.length,
  };
}

export function useAnalytics(
  filterInstitute: string,
  filterCategory: string,
): UseAnalyticsReturn {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = () => setTick((t) => t + 1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const run = async () => {
      try {
        const constraints: QueryConstraint[] = [];
        if (filterInstitute !== "All")
          constraints.push(where("institute", "==", filterInstitute));
        if (filterCategory !== "All")
          constraints.push(where("category", "==", filterCategory));
        constraints.push(orderBy("timestamp", "desc"));

        const snapshot = await getDocs(
          query(collection(db, "coap_offers"), ...constraints),
        );

        if (cancelled) return;

        const offers = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Offer,
        );

        setData(computeAnalytics(offers));
      } catch (err) {
        if (!cancelled) setError("Failed to load analytics data.");
        console.error("Analytics fetch error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [filterInstitute, filterCategory, tick]);

  return { data, loading, error, refetch };
}
