import { redirect } from "next/navigation";
import {
  createApiKey,
  createEnvironment,
  createProject,
  createSecret,
  deleteApiKey,
  deleteEnvironment,
  deleteProject,
  deleteSecret,
} from "@/actions/projects";
import { getSessionUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ProjectClient } from "./project-client";

export default async function ProjectsPage() {
  const sessionUserId = getSessionUserId();

  if (!sessionUserId) {
    redirect("/sign-in");
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: sessionUserId },
    orderBy: { createdAt: "desc" },
    include: {
      environments: {
        include: {
          secrets: {
            orderBy: { createdAt: "desc" },
          },
          apiKeys: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  return (
    <ProjectClient 
      projects={projects} 
      actions={{
        createProject,
        createEnvironment,
        deleteProject,
        deleteEnvironment,
        createSecret,
        deleteSecret,
        createApiKey,
        deleteApiKey
      }} 
    />
  );
}
