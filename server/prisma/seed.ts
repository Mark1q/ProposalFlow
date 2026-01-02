import { prisma } from "../lib/prisma";
import { faker } from "@faker-js/faker";
import * as bcrypt from "bcryptjs"
import { RegisterInput } from "../interfaces/auth.interface";

const generateUsers = async (): Promise<RegisterInput[]> => {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = Array.from({ length: 10 }).map(() => ({
    email: faker.internet.email().toLowerCase(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    password: hashedPassword
  }));

  return users;
}

const generateScopes = async () => {
  const userIds = (await prisma.user.findMany()).map(user => user.id);

  const techPool = ['React', 'Next.js', 'Prisma', 'PostgreSQL', 'Tailwind CSS', 'FastAPI', 'Redis', 'Docker'];
  const featurePool = ['User Auth', 'Real-time Chat', 'AI Integration', 'Payment Gateway', 'Analytics Dashboard', 'Export to PDF'];

  const scopes = Array.from({ length : 10 }).map(() => ({
    userId: faker.helpers.arrayElement(userIds),
    scopeJson: {
      projectName: faker.company.name(),
      businessGoal: faker.lorem.sentence(),
      features: faker.helpers.arrayElements(featurePool, { min: 2, max: 5 }),
      techStack: faker.helpers.arrayElements(techPool, { min: 2, max: 5 }),
      budget: faker.number.int({ min: 5000, max: 50000 }),
      timeline: `${faker.number.int({ min: 1, max: 6 })} months`
    }
  }))

  return scopes;
}

async function main() {
  console.log('Cleaning up database...');
  await prisma.user.deleteMany();

  console.log('🌱 Seeding database...');

  const usersData = await generateUsers();
  await prisma.user.createMany({ data: usersData, skipDuplicates: true });

  const scopesData = await generateScopes();
  await prisma.scope.createMany({ data: scopesData, skipDuplicates: true });
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  });