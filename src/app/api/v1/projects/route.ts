import { parseBearerToken } from "@/lib/api-keys";
import { validatePAT } from "@/lib/auth/pat";
import { prisma } from "@/lib/prisma";
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

    const pat = await validatePAT(token);

    if (!pat) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 },
      );
    }

    const projects = await prisma.project.findMany({
      where: { ownerId: pat.userId },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { environments: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        environmentCount: p._count.environments,
      })),
    });
  } catch (error) {
    console.error("API Get Projects Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
