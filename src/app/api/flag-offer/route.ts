import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebaseAdmin";

const FLAG_THRESHOLD = 5;

interface FlagRequestBody {
  offerId: string;
}

interface FlagResponse {
  success: boolean;
  newCount?: number;
  hidden?: boolean;
  error?: string;
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<FlagResponse>> {
  try {
    const body = (await request.json()) as Partial<FlagRequestBody>;

    // Basic validation
    if (!body.offerId || typeof body.offerId !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid offer ID." },
        { status: 400 },
      );
    }

    // Sanitize: doc IDs shouldn't contain slashes
    if (body.offerId.includes("/")) {
      return NextResponse.json(
        { success: false, error: "Malformed offer ID." },
        { status: 400 },
      );
    }

    const db = getAdminDb();
    const ref = db.collection("coap_offers").doc(body.offerId);

    // Atomic transaction: read → validate → increment
    const newCount = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);

      if (!snap.exists) {
        throw new Error("Offer not found.");
      }

      const current = (snap.data()?.flagCount as number | undefined) ?? 0;

      // Already at or past threshold — no need to write again
      if (current >= FLAG_THRESHOLD) return current;

      const next = current + 1;
      tx.update(ref, { flagCount: FieldValue.increment(1) });
      return next;
    });

    return NextResponse.json({
      success: true,
      newCount,
      hidden: newCount >= FLAG_THRESHOLD,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[flag-offer]", message);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
