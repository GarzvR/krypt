import {
  getApiKeyContextByToken,
  parseBearerToken,
  touchApiKeyLastUsed,
} from "@/lib/api-keys";
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

    const apiKey = await getApiKeyContextByToken(token);

    if (!apiKey || !apiKey.user) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 },
      );
    }

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
  } catch (error) {
    console.error("API Info Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
