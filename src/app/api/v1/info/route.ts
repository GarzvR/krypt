import {
  getApiKeyContextByToken,
  parseBearerToken,
  touchApiKeyLastUsed,
} from "@/lib/api-keys";
import { validatePAT } from "@/lib/auth/pat";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const token = parseBearerToken(req.headers.get("authorization"));

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid token" },
        { status: 401 },
      );
    }

    // Try API Key first
    const apiKey = await getApiKeyContextByToken(token);
    if (apiKey) {
      await touchApiKeyLastUsed(apiKey.id);
      return NextResponse.json({
        user: apiKey.user.email,
        tokenScope: "environment",
        project: {
          id: apiKey.environment.project.id,
          name: apiKey.environment.project.name,
          slug: apiKey.environment.project.slug,
        },
        environment: {
          id: apiKey.environment.id,
          name: apiKey.environment.name,
        },
      });
    }

    // Try Personal Access Token
    const pat = await validatePAT(token);
    if (pat) {
      return NextResponse.json({
        user: pat.user.email,
        tokenScope: "user",
      });
    }

    return NextResponse.json(
      { error: "Unauthorized: Invalid token" },
      { status: 401 },
    );
  } catch (error) {
    console.error("API Info Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
