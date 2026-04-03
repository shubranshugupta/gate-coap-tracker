"use client";

import { useEffect, useState } from "react";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "@/config/firebase";

export function useSubmissionCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const snapshot = await getCountFromServer(
          collection(db, "coap_offers"),
        );
        setCount(snapshot.data().count);
      } catch (error) {
        console.error("Error fetching count:", error);
        setCount(0);
      }
    };

    fetchCount();
  }, []);

  return count;
}
