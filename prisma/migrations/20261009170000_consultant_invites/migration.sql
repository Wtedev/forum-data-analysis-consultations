ALTER TABLE "AdminUser" ADD COLUMN "consultantKey" TEXT;

CREATE UNIQUE INDEX "AdminUser_consultantKey_key" ON "AdminUser"("consultantKey");

CREATE TABLE "ConsultantInvite" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "consultantKey" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultantInvite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ConsultantInvite_tokenHash_key" ON "ConsultantInvite"("tokenHash");
CREATE INDEX "ConsultantInvite_email_idx" ON "ConsultantInvite"("email");
CREATE INDEX "ConsultantInvite_consultantKey_idx" ON "ConsultantInvite"("consultantKey");

ALTER TABLE "ConsultantInvite" ADD CONSTRAINT "ConsultantInvite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

DELETE FROM "AdminUser" WHERE lower("email") = 'ceo@kafaat.org.sa';
