// src/hooks/useOffers.ts
"use client";

import { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  where,
  startAfter,
  getDocs,
  onSnapshot,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type { Offer } from "@/types";

const PAGE_SIZE = 20;
const FLAG_THRESHOLD = Number.parseInt(process.env.NEXT_PUBLIC_FLAG_THRESHOLD || "5");

export interface UseOffersReturn {
  offers: Offer[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  totalLoaded: number;
  newIds: Set<string>;
  loadMore: () => Promise<void>;
}

// Filter helper — centralised so both live + paginated pages use it
function filterVisible(offers: Offer[]): Offer[] {
  return offers.filter((o) => (o.flagCount ?? 0) < FLAG_THRESHOLD);
}

export function useOffers(
  filterInstitute: string,
  filterCategory: string,
): UseOffersReturn {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  const olderRef = useRef<Offer[]>([]);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setOffers([]);
    setHasMore(true);
    olderRef.current = [];
    isFirstLoad.current = true;

    const constraints: QueryConstraint[] = [];
    if (filterInstitute !== "All")
      constraints.push(where("institute", "==", filterInstitute));
    if (filterCategory !== "All")
      constraints.push(where("category", "==", filterCategory));
    constraints.push(orderBy("timestamp", "desc"));
    constraints.push(limit(PAGE_SIZE));

    const q = query(collection(db, "coap_offers"), ...constraints);

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const live = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Offer,
        );

        if (!isFirstLoad.current) {
          const addedIds = snapshot
            .docChanges()
            .filter((c) => c.type === "added")
            .map((c) => c.doc.id);

          if (addedIds.length > 0) {
            setNewIds(new Set(addedIds));
            setTimeout(() => setNewIds(new Set()), 2500);
          }
        }
        isFirstLoad.current = false;

        const olderIds = new Set(olderRef.current.map((o) => o.id));
        const dedupedLive = live.filter((o) => !olderIds.has(o.id));

        // ← filter out community-flagged offers
        setOffers(filterVisible([...dedupedLive, ...olderRef.current]));
        setLastVisible(snapshot.docs.at(-1) ?? null);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore onSnapshot error:", err);
        setError("Failed to load offers. Check your connection and try again.");
        setLoading(false);
      },
    );

    return () => {
      unsub();
      olderRef.current = [];
    };
  }, [filterInstitute, filterCategory]);

  const loadMore = async () => {
    if (!lastVisible || loadingMore) return;
    setLoadingMore(true);

    try {
      const constraints: QueryConstraint[] = [];
      if (filterInstitute !== "All")
        constraints.push(where("institute", "==", filterInstitute));
      if (filterCategory !== "All")
        constraints.push(where("category", "==", filterCategory));
      constraints.push(orderBy("timestamp", "desc"));
      constraints.push(startAfter(lastVisible));
      constraints.push(limit(PAGE_SIZE));

      const snapshot = await getDocs(
        query(collection(db, "coap_offers"), ...constraints),
      );

      if (snapshot.empty) {
        setHasMore(false);
        return;
      }

      const more = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Offer,
      );
      olderRef.current = [...olderRef.current, ...more];

      setOffers((prev) => {
        const seen = new Set(prev.map((o) => o.id));
        const next = [...prev, ...more.filter((o) => !seen.has(o.id))];
        return filterVisible(next); // ← filter here too
      });
      setLastVisible(snapshot.docs.at(-1) ?? null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (err) {
      console.error("loadMore error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return {
    offers,
    loading,
    loadingMore,
    hasMore,
    error,
    totalLoaded: offers.length,
    newIds,
    loadMore,
  };
}
