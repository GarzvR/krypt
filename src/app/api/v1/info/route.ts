import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    
    // Find the API key and its associated environment/project
    const apiKey = await prisma.apiKey.findUnique({
      where: { key: token },
      include: {
        user: true,
        environment: {
          include: {
            project: true
          }
        }
      },
    });

    if (!apiKey || !apiKey.user) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    // Since token is now env-specific, return just that context
    const projects = [
      {
        id: apiKey.environment.projectId,
        name: apiKey.environment.project.name,
        slug: apiKey.environment.project.slug,
        environments: [
          {
            id: apiKey.environmentId,
            name: apiKey.environment.name,
          },
        ],
      },
    ];

    return NextResponse.json({
      user: apiKey.user.email,
      projects
    });

  } catch (error) {
    console.error("API Info Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
