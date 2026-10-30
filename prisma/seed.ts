import "dotenv/config";

import bcrypt from "bcryptjs";

import { getPrisma } from "../src/lib/prisma";

const CONSULTANTS = [
  { name: "م.فهد الدوسري", email: "fahad.aldosari@example.com", consultantKey: "FAHAD_ALDOSARI" },
  { name: "م.نورة القحطاني", email: "nora.alqahtani@example.com", consultantKey: "NORA_ALQAHTANI" },
  { name: "م.خالد العتيبي", email: "khalid.alotaibi@example.com", consultantKey: "KHALID_ALOTAIBI" },
  { name: "م.محمد الزهراني", email: "mohammed.alzahrani@example.com", consultantKey: "MOHAMMED_ALZAHRANI" },
  { name: "م.ريم السديري", email: "reem.alsudairi@example.com", consultantKey: "REEM_ALSUDAIRI" },
];

async function main() {
  const adminPasswordHash = await bcrypt.hash("admin12345", 10);
  const consultantPasswordHash = await bcrypt.hash("consultant12345", 10);

  await getPrisma().adminUser.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "مدير النظام",
      email: "admin@example.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  for (const consultant of CONSULTANTS) {
    await getPrisma().adminUser.upsert({
      where: { email: consultant.email },
      update: {
        name: consultant.name,
        consultantKey: consultant.consultantKey,
        visibleToApplicants: true,
      },
      create: {
        name: consultant.name,
        email: consultant.email,
        passwordHash: consultantPasswordHash,
        role: "CONSULTANT",
        consultantKey: consultant.consultantKey,
        visibleToApplicants: true,
      },
    });
  }

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
