const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.user.updateMany({
    where: { email: 'test@example.com' },
    data: { role: 'admin' },
  })
  console.log('test@example.com is now an admin')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
