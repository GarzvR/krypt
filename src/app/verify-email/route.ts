import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/auth/email-verification";

function redirectToSignIn(message: string, type: "error" | "notice") {
  const url = new URL("/sign-in", process.env.APP_URL ?? "http://localhost:3000");
  url.searchParams.set(type, message);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return redirectToSignIn("Verification link is missing or invalid.", "error");
  }

  const result = await verifyEmailToken(token);

  if (!result.ok) {
    const message =
      result.reason === "expired"
        ? "This verification link has expired. Request a new one and try again."
        : "Verification link is invalid.";

    return redirectToSignIn(message, "error");
  }

  return redirectToSignIn(
    "Email verified. You can sign in now.",
    "notice",
  );
}
