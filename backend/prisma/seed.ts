
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const superUser = await prisma.user.upsert({
    where: { email: 'admin@gsacreditus.com.br' },
    update: {},
    create: {
      email: 'admin@gsacreditus.com.br',
      name: 'Administrador GSA',
      password: hashedPassword,
      role: 'SUPER',
      balance: 1000,
      active: true,
      isAtivo: true,
    },
  });

  console.log({ superUser });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
