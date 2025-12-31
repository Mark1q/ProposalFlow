import { prisma } from "../lib/prisma";

async function main() {
  console.log('🌱 Seeding database...')

  const testUser = await prisma.user.upsert({
    where: { email: 'dev@example.com' }, 
    update: {}, 
    create: {
      email: 'dev@example.com',
      password: 'dev'
    },
  })

  console.log(`✅ Created/Verified user: ${testUser.email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })