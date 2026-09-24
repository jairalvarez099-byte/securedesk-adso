import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const users = [
    {
      name: "Admin",
      email: "admin@securedesk.com",
      password: "Admin123*",
      role: "ADMIN",
    },
    {
      name: "Analista",
      email: "analista@securedesk.com",
      password: "Analista123*",
      role: "ANALISTA",
    },
    {
      name: "Consulta",
      email: "consulta@securedesk.com",
      password: "Consulta123*",
      role: "CONSULTA",
    },
  ];

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);

    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        passwordHash,
        role: user.role,
        isActive: true,
      },
    });
  }

  console.log("Seed ejecutado correctamente: usuarios creados o ya existentes.");
}

main()
  .catch((error) => {
    console.error("Error ejecutando seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });