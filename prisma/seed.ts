import "dotenv/config";

import bcrypt from "bcryptjs";

import { getPrisma } from "../src/lib/prisma";

async function main() {
  const passwordHash = await bcrypt.hash("admin12345", 10);

  await getPrisma().adminUser.upsert({
    where: { email: "admin@madrak.sa" },
    update: {},
    create: {
      name: "مدير النظام",
      email: "admin@madrak.sa",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
