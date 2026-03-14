"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import { getCurrentPlan, hasReachedLimit } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { encryptSecretValue } from "@/lib/security/secrets";
import { logAudit } from "@/lib/audit";

function requireSessionUserId() {
  const sessionUserId = getSessionUserId();

  if (!sessionUserId) {
    redirect("/sign-in");
  }

  return sessionUserId;
}

async function getActorEmail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  return user?.email ?? "unknown";
}

function toSlug(input: string) {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "project"
  );
}

function normalizeEnvironmentName(input: string) {
  return input.trim().toLowerCase().replace(/\s+/g, "-");
}

function normalizeSecretKey(input: string) {
  return input
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

async function getUniqueProjectSlug(baseName: string) {
  const baseSlug = toSlug(baseName);
  let slug = baseSlug;
  let attempt = 1;

  while (true) {
    const existing = await prisma.project.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${attempt}`;
    attempt += 1;
  }
}

export async function createProject(formData: FormData) {
  const sessionUserId = requireSessionUserId();
  const name = formData.get("name")?.toString().trim() ?? "";
  const currentPlan = getCurrentPlan();

  if (!name) {
    return;
  }

  const projectCount = await prisma.project.count({
    where: { ownerId: sessionUserId },
  });

  if (hasReachedLimit(projectCount, currentPlan.projectLimit)) {
    return;
  }

  const slug = await getUniqueProjectSlug(name);

  const project = await prisma.project.create({
    data: {
      name,
      slug,
      ownerId: sessionUserId,
    },
  });

  logAudit({
    action: "PROJECT_CREATED",
    actor: await getActorEmail(sessionUserId),
    targetType: "Project",
    targetName: name,
    projectId: project.id,
    userId: sessionUserId,
  });

  revalidatePath("/dashboard");
  revalidatePath("/projects");
}

export async function createEnvironment(formData: FormData) {
  const sessionUserId = requireSessionUserId();
  const projectId = formData.get("projectId")?.toString() ?? "";
  const name = normalizeEnvironmentName(formData.get("name")?.toString() ?? "");
  const currentPlan = getCurrentPlan();

  if (!projectId || !name) {
    return;
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: sessionUserId,
    },
    select: { id: true },
  });

  if (!project) {
    return;
  }

  const environmentCount = await prisma.environment.count({
    where: {
      project: {
        ownerId: sessionUserId,
      },
    },
  });

  if (hasReachedLimit(environmentCount, currentPlan.environmentLimit)) {
    return;
  }

  await prisma.environment.upsert({
    where: {
      projectId_name: {
        projectId,
        name,
      },
    },
    update: {},
    create: {
      projectId,
      name,
    },
  });

  logAudit({
    action: "ENVIRONMENT_CREATED",
    actor: await getActorEmail(sessionUserId),
    targetType: "Environment",
    targetName: name,
    projectId,
    userId: sessionUserId,
  });

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/usage");
}

export async function createSecret(formData: FormData) {
  const sessionUserId = requireSessionUserId();
  const environmentId = formData.get("environmentId")?.toString() ?? "";
  const key = normalizeSecretKey(formData.get("key")?.toString() ?? "");
  const value = formData.get("value")?.toString() ?? "";
  const description = formData.get("description")?.toString().trim() ?? "";
  const currentPlan = getCurrentPlan();

  if (!environmentId || !key || !value) {
    return;
  }

  const environment = await prisma.environment.findFirst({
    where: {
      id: environmentId,
      project: {
        ownerId: sessionUserId,
      },
    },
    select: { id: true, projectId: true },
  });

  if (!environment) {
    return;
  }

  const existingSecret = await prisma.secret.findUnique({
    where: {
      environmentId_key: {
        environmentId,
        key,
      },
    },
    select: { id: true },
  });

  if (!existingSecret) {
    const secretCount = await prisma.secret.count({
      where: {
        environment: {
          project: {
            ownerId: sessionUserId,
          },
        },
      },
    });

    if (hasReachedLimit(secretCount, currentPlan.secretLimit)) {
      return;
    }
  }

  const encryptedValue = encryptSecretValue(value, environmentId);

  await prisma.secret.upsert({
    where: {
      environmentId_key: {
        environmentId,
        key,
      },
    },
    update: {
      value: encryptedValue,
      description: description || null,
    },
    create: {
      environmentId,
      key,
      value: encryptedValue,
      description: description || null,
    },
  });

  logAudit({
    action: existingSecret ? "SECRET_UPDATED" : "SECRET_CREATED",
    actor: await getActorEmail(sessionUserId),
    targetType: "Secret",
    targetName: key,
    projectId: environment!.projectId,
    userId: sessionUserId,
  });

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/usage");
}

export async function deleteSecret(formData: FormData) {
  const sessionUserId = requireSessionUserId();
  const secretId = formData.get("secretId")?.toString() ?? "";

  if (!secretId) {
    return;
  }

  const secret = await prisma.secret.findFirst({
    where: {
      id: secretId,
      environment: {
        project: {
          ownerId: sessionUserId,
        },
      },
    },
    select: { id: true, key: true, environment: { select: { projectId: true } } },
  });

  if (!secret) {
    return;
  }

  await prisma.secret.delete({
    where: { id: secret.id },
  });

  logAudit({
    action: "SECRET_DELETED",
    actor: await getActorEmail(sessionUserId),
    targetType: "Secret",
    targetName: secret.key,
    projectId: secret.environment.projectId,
    userId: sessionUserId,
  });

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/usage");
}

export async function deleteEnvironment(formData: FormData) {
  const sessionUserId = requireSessionUserId();
  const environmentId = formData.get("environmentId")?.toString() ?? "";

  if (!environmentId) {
    return;
  }

  const environment = await prisma.environment.findFirst({
    where: {
      id: environmentId,
      project: {
        ownerId: sessionUserId,
      },
    },
    select: { id: true, name: true, projectId: true },
  });

  if (!environment) {
    return;
  }

  logAudit({
    action: "ENVIRONMENT_DELETED",
    actor: await getActorEmail(sessionUserId),
    targetType: "Environment",
    targetName: environment.name,
    projectId: environment.projectId,
    userId: sessionUserId,
  });

  await prisma.environment.delete({
    where: { id: environment.id },
  });

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/usage");
}

export async function deleteProject(formData: FormData) {
  const sessionUserId = requireSessionUserId();
  const projectId = formData.get("projectId")?.toString() ?? "";

  if (!projectId) {
    return;
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: sessionUserId,
    },
    select: { id: true, name: true },
  });

  if (!project) {
    return;
  }

  logAudit({
    action: "PROJECT_DELETED",
    actor: await getActorEmail(sessionUserId),
    targetType: "Project",
    targetName: project.name,
    projectId: project.id,
    userId: sessionUserId,
  });

  await prisma.project.delete({
    where: { id: project.id },
  });

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/usage");
}

export async function createApiKey(formData: FormData) {
  const sessionUserId = requireSessionUserId();
  const environmentId = formData.get("environmentId")?.toString() ?? "";
  const name = formData.get("name")?.toString().trim() ?? "";

  if (!environmentId || !name) {
    return;
  }

  const environment = await prisma.environment.findFirst({
    where: {
      id: environmentId,
      project: {
        ownerId: sessionUserId,
      },
    },
    select: { id: true, projectId: true },
  });

  if (!environment) {
    return;
  }

  const token = `krp_${crypto.randomUUID().replace(/-/g, "")}${Date.now().toString(36)}`;

  await prisma.apiKey.create({
    data: {
      environmentId,
      name,
      key: token,
    },
  });

  logAudit({
    action: "APIKEY_CREATED",
    actor: await getActorEmail(sessionUserId),
    targetType: "ApiKey",
    targetName: name,
    projectId: environment.projectId,
    userId: sessionUserId,
  });

  revalidatePath("/dashboard");
  revalidatePath("/projects");
}

export async function deleteApiKey(formData: FormData) {
  const sessionUserId = requireSessionUserId();
  const apiKeyId = formData.get("apiKeyId")?.toString() ?? "";

  if (!apiKeyId) {
    return;
  }

  const apiKey = await prisma.apiKey.findFirst({
    where: {
      id: apiKeyId,
      environment: {
        project: {
          ownerId: sessionUserId,
        },
      },
    },
    select: { id: true, name: true, environment: { select: { projectId: true } } },
  });

  if (!apiKey) {
    return;
  }

  logAudit({
    action: "APIKEY_REVOKED",
    actor: await getActorEmail(sessionUserId),
    targetType: "ApiKey",
    targetName: apiKey.name,
    projectId: apiKey.environment.projectId,
    userId: sessionUserId,
  });

  await prisma.apiKey.delete({
    where: { id: apiKey.id },
  });

  revalidatePath("/dashboard");
  revalidatePath("/projects");
}
