import { syncPlanFromWebhook, verifyLemonSignature } from "@/lib/billing";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyLemonSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody);
    await syncPlanFromWebhook(payload);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Lemon webhook failed:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
