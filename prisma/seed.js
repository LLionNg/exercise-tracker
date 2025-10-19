const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const user1 = await prisma.user.upsert({
    where: { email: 'lionngdev@gmail.com' },
    update: {},
    create: {
      email: 'lionngdev@gmail.com',
      name: 'Lionng Dev',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'myster.pmysterios@gmail.com' },
    update: {},
    create: {
      email: 'myster.pmysterios@gmail.com',
      name: 'Myster Pmysterios',
    },
  });

  console.log('✅ Seeded users:', { user1, user2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });