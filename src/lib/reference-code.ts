import type { PrismaClient } from "@prisma/client";

type DbClient = Pick<PrismaClient, "consultation">;

export async function generateReferenceCode(
  db: DbClient,
  date = new Date(),
): Promise<string> {
  const year = date.getFullYear();
  const prefix = `MDK-${year}-`;

  const last = await db.consultation.findFirst({
    where: {
      referenceCode: {
        startsWith: prefix,
      },
    },
    orderBy: {
      referenceCode: "desc",
    },
    select: {
      referenceCode: true,
    },
  });

  let sequence = 1;

  if (last?.referenceCode) {
    const suffix = last.referenceCode.slice(prefix.length);
    const parsed = Number.parseInt(suffix, 10);
    if (!Number.isNaN(parsed)) {
      sequence = parsed + 1;
    }
  }

  return `${prefix}${String(sequence).padStart(6, "0")}`;
}
