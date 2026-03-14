const { PrismaClient } = require('@prisma/client');

// Use encoding for the password '@Fool9idol!' -> '%40Fool9idol%21'
const url = "postgresql://postgres.ryrmpmzauevvqipzkham:%40Fool9idol%21@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: url,
    },
  },
});

async function main() {
  console.log("Checking production database...");
  try {
    const userCount = await prisma.user.count();
    console.log(`Connection successful! Total users: ${userCount}`);
    
    const users = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { email: true, role: true, createdAt: true }
    });
    
    console.log("Latest users:", JSON.stringify(users, null, 2));

    const logs = await prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    console.log("Latest audit logs:", JSON.stringify(logs, null, 2));

  } catch (error) {
    console.error("DATABASE ERROR:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
