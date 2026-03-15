import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface AuditLogInput {
  action: string;
  actor: string;
  targetType: "Project" | "Environment" | "Secret" | "ApiKey";
  targetName: string;
  projectId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Records an audit log entry. Fire-and-forget: errors are logged
 * but never block the caller.
 */
export function logAudit(input: AuditLogInput) {
  prisma.auditLog
    .create({
      data: {
        action: input.action,
        actor: input.actor,
        targetType: input.targetType,
        targetName: input.targetName,
        projectId: input.projectId ?? undefined,
        userId: input.userId ?? undefined,
        metadata: (input.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    })
    .catch((err) => {
      console.error("[AuditLog] Failed to write:", err);
    });
}
