import { NextRequest, NextResponse } from "next/server";
import type { TurnstileVerifyResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { token?: string };

    if (!body.token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 400 },
      );
    }

    // Cloudflare requires multipart/form-data for verification
    const formData = new FormData();
    formData.append("secret", process.env.TURNSTILE_SECRET_KEY!);
    formData.append("response", body.token);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: formData },
    );

    const data = (await res.json()) as TurnstileVerifyResponse;

    if (data.success) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: data["error-codes"] ?? ["unknown-error"] },
      { status: 400 },
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal verification error" },
      { status: 500 },
    );
  }
}
