import type { Timestamp } from "firebase/firestore";

export interface Offer {
  id: string;
  gateScore: number;
  gateRank: number;
  category: string;
  institute: string;
  programType: string;
  specialization: string;
  coapRound: string;
  userId: string;
  timestamp: Timestamp | null;
  flagCount?: number;
}

// Renamed from FormData → OfferFormData to avoid clash with browser's built-in FormData
export interface OfferFormData {
  gateScore: string;
  gateRank: string;
  category: string;
  institute: string;
  programType: string;
  specialization: string;
  coapRound: string;
}

export type Theme = "dark" | "light";

export interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
}
