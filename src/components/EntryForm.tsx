// src/components/EntryForm.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { db, auth } from "@/config/firebase";
import {
  CATEGORIES,
  INSTITUTES,
  PROGRAM_TYPES,
  ROUNDS,
} from "@/utils/constants";
import type { OfferFormData } from "@/types";

/* ── Constants ──────────────────────────────────────────── */
const INITIAL_FORM: OfferFormData = {
  gateScore: "",
  gateRank: "",
  category: CATEGORIES[1],
  institute: INSTITUTES[1],
  programType: PROGRAM_TYPES[0],
  specialization: "",
  coapRound: ROUNDS[0],
};

const SUBMIT_TIMEOUT_MS = 15_000; // 15 seconds max

/* ── Helpers ────────────────────────────────────────────── */
function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms / 1000}s`)),
      ms,
    );
    promise
      .then((v) => {
        clearTimeout(timer);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(timer);
        reject(e);
      });
  });
}

/* ── Sub-components (unchanged) ─────────────────────────── */
const PencilIcon = () => (
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
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const ShieldIcon = () => (
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
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
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

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

const Field = ({
  label,
  required = false,
  children,
  className = "",
}: FieldProps) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label
      className="flex items-center gap-1 text-[10px] font-semibold tracking-widest uppercase select-none"
      style={{
        fontFamily: "var(--font-mono)",
        color: "var(--color-text-muted)",
      }}
    >
      {label}
      {required && (
        <span style={{ color: "var(--color-accent)", fontSize: "0.6rem" }}>
          ●
        </span>
      )}
    </label>
    {children}
  </div>
);

/* ── Main Component ─────────────────────────────────────── */
export default function EntryForm() {
  const { resolvedTheme } = useTheme();
  const [formData, setFormData] = useState<OfferFormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const resetForm = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      gateScore: "",
      gateRank: "",
      specialization: "",
    }));
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    /* ── Validation ── */
    const score = Number(formData.gateScore);
    const rank = Number(formData.gateRank);

    if (isNaN(score) || score < 0 || score > 1000) {
      toast.error("GATE Score must be between 0 and 1000.");
      return;
    }
    if (isNaN(rank) || rank <= 0 || !Number.isInteger(rank)) {
      toast.error("GATE Rank must be a positive whole number.");
      return;
    }
    if (!formData.specialization.trim() || formData.specialization.length > 50) {
      toast.error("Specialization cannot be empty and must be under 50 characters.");
      return;
    }
    if (!turnstileToken) {
      toast.error("Please complete the security check.");
      return;
    }

    setLoading(true);
    console.log("[Submit] Starting submission…");

    try {
      /* ── Step 1: Verify Turnstile server-side ── */
      console.log("[Submit] Step 1 → Verifying Turnstile…");
      const verifyRes = await withTimeout(
        fetch("/api/verify-turnstile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: turnstileToken }),
        }),
        10_000,
        "Turnstile verification",
      );

      if (!verifyRes.ok) {
        const errBody = await verifyRes.text();
        console.error("[Submit] Turnstile failed:", verifyRes.status, errBody);
        throw new Error("Security check failed. Please refresh and try again.");
      }
      console.log("[Submit] Step 1 ✅ Turnstile passed");

      /* ── Step 2: Anonymous Firebase Auth ── */
      console.log("[Submit] Step 2 → Signing in anonymously…");
      const { user } = await withTimeout(
        signInAnonymously(auth),
        10_000,
        "Firebase anonymous sign-in",
      );
      const uid = user.uid;
      console.log("[Submit] Step 2 ✅ Signed in as:", uid);

      /* ── Step 3: Build compound doc ID ── */
      const safeInstitute = formData.institute.replace(/[^a-zA-Z0-9]/g, "");
      const safeRound = formData.coapRound.replace(/[^a-zA-Z0-9]/g, "");
      const safeProgram = formData.programType.replace(/[^a-zA-Z0-9]/g, "");
      const docId = `${uid}_${safeInstitute}_${safeProgram}_${safeRound}`;
      console.log("[Submit] Step 3 → Doc ID:", docId);

      /* ── Step 4: Write to Firestore ── */
      console.log("[Submit] Step 4 → Writing to Firestore…");
      const payload = {
        ...formData,
        userId: uid,
        gateScore: score,
        gateRank: rank,
        flagCount: 0,
        timestamp: serverTimestamp(),
      };
      console.log("[Submit] Payload:", JSON.stringify(payload, null, 2));

      await withTimeout(
        setDoc(doc(db, "coap_offers", docId), payload),
        SUBMIT_TIMEOUT_MS,
        "Firestore write",
      );
      console.log("[Submit] Step 4 ✅ Firestore write succeeded!");

      toast.success("Offer reported successfully! 🎉");
      resetForm();
    } catch (error: unknown) {
      console.error("[Submit] ❌ Error caught:", error);

      // Surface Firebase-specific errors clearly
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code) {
        console.error("[Submit] Firebase error code:", firebaseError.code);
      }

      let userMessage = "Submission failed. Please try again.";

      if (firebaseError.code === "permission-denied") {
        userMessage =
          "Duplicate entry not allowed: Only one offer per institute/program/round.";
      } else if (firebaseError.code === "auth/operation-not-allowed") {
        userMessage = "Anonymous auth is not enabled in Firebase console.";
      } else if (
        error instanceof Error &&
        error.message.includes("timed out")
      ) {
        userMessage = error.message;
      } else if (error instanceof Error) {
        userMessage = error.message;
      }

      toast.error(userMessage);

      // Reset Turnstile on error so user can re-verify
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } finally {
      // ✅ ALWAYS runs — even if a timeout fires
      console.log("[Submit] Finally → setting loading = false");
      setLoading(false);
    }
  };

  /* ── Shared input style ── */
  const inputCls = "input-base px-3 py-2.5 text-sm";
  const selectCls = `${inputCls} cursor-pointer`;
  const canSubmit = !loading && !!turnstileToken;

  return (
    <div className="card p-6 md:p-8">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: "var(--color-accent-muted)",
              border: "1px solid var(--color-accent-dim)",
              color: "var(--color-accent)",
            }}
          >
            <PencilIcon />
          </div>
          <div>
            <h2
              className="text-lg font-bold"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              Report an Offer
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-muted)",
              }}
            >
              anonymous · no login required
            </p>
          </div>
        </div>
        <div
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs flex-shrink-0"
          style={{
            background: "var(--color-violet-muted)",
            border: "1px solid rgba(129,140,248,0.2)",
            color: "var(--color-violet)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <ShieldIcon />1 entry per institute per round
        </div>
      </div>

      <div className="glow-divider mb-6" />

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="GATE Score" required>
            <input
              id="gateScore"
              name="gateScore"
              type="number"
              min="0"
              max="1000"
              step="0.01"
              required
              placeholder="e.g. 740.5"
              value={formData.gateScore}
              onChange={handleChange}
              className={inputCls}
            />
          </Field>
          <Field label="GATE Rank" required>
            <input
              id="gateRank"
              name="gateRank"
              type="number"
              min="1"
              step="1"
              required
              placeholder="e.g. 192"
              value={formData.gateRank}
              onChange={handleChange}
              className={inputCls}
            />
          </Field>
          <Field label="Category" required>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={selectCls}
            >
              {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Institute" required>
            <select
              id="institute"
              name="institute"
              value={formData.institute}
              onChange={handleChange}
              className={selectCls}
            >
              {INSTITUTES.filter((i) => i !== "All").map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Program Type" required>
            <select
              id="programType"
              name="programType"
              value={formData.programType}
              onChange={handleChange}
              className={selectCls}
            >
              {PROGRAM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Specialization"
            required
            className="sm:col-span-1 lg:col-span-2"
          >
            <input
              id="specialization"
              name="specialization"
              type="text"
              required
              placeholder="e.g. Computer Science, AI, Data Science"
              value={formData.specialization}
              onChange={handleChange}
              className={inputCls}
            />
          </Field>
          <Field label="COAP Round" required>
            <select
              id="coapRound"
              name="coapRound"
              value={formData.coapRound}
              onChange={handleChange}
              className={selectCls}
            >
              {ROUNDS.map((round) => (
                <option key={round} value={round}>
                  {round}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-start gap-1">
            <span
              className="text-[10px] font-semibold tracking-widest uppercase mb-1"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-muted)",
              }}
            >
              Security Check
            </span>
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: "1px solid var(--color-border)" }}
            >
              <Turnstile
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                options={{
                  theme: resolvedTheme === "dark" ? "dark" : "light",
                  size: "normal",
                }}
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
                onError={() => {
                  setTurnstileToken(null);
                  toast.error("Security check failed. Please refresh.");
                }}
              />
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-accent w-full sm:w-48 h-11 flex items-center justify-center gap-2 text-sm"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {loading ? (
                <>
                  <SpinnerIcon />
                  <span>Submitting…</span>
                </>
              ) : (
                "Submit Offer"
              )}
            </button>
            <p
              className="text-[11px]"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-muted)",
              }}
            >
              {!turnstileToken && !loading
                ? "Complete security check to submit"
                : "Data is anonymous · No PII collected"}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
