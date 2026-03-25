import { parseBearerToken } from "@/lib/api-keys";
import { validatePAT } from "@/lib/auth/pat";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } },
) {
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

    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        ownerId: pat.userId,
      },
      include: {
        environments: {
          select: {
            id: true,
            name: true,
          },
          orderBy: { name: "asc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      environments: project.environments,
    });
  } catch (error) {
    console.error("API Get Environments Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
