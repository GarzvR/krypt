const { PrismaClient } = require('@prisma/client');

const url = "postgresql://postgres.ryrmpmzauevvqipzkham:%40Fool9idol%21@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: url,
    },
  },
});

async function main() {
  const sessionUserId = "cmmps3d390000l404m0kcsw22"; // The test-prod-debug user ID from previous check
  
  console.log(`Simulating ProjectsPage query for user ${sessionUserId}...`);
  
  try {
    const start = Date.now();
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
    const end = Date.now();
    
    console.log(`Query successful! Took ${end - start}ms.`);
    console.log(`Found ${projects.length} projects.`);
    
    projects.forEach(p => {
        console.log(`- Project: ${p.name}, Envs: ${p.environments.length}`);
        p.environments.forEach(e => {
            console.log(`  - Env: ${e.name}, Secrets: ${e.secrets.length}, API Keys: ${e.apiKeys.length}`);
        });
    });

  } catch (error) {
    console.error("QUERY ERROR:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
  } finally {
    await prisma.$disconnect();
  }
}

main();
