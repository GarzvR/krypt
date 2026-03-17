
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      emailVerifiedAt: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log('Recent Users:', JSON.stringify(users, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
