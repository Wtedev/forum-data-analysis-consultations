-- Reference codes used an old project abbreviation. New codes use MLT (ملتقى).
UPDATE "Consultation"
SET "referenceCode" = REPLACE("referenceCode", 'MDK-', 'MLT-')
WHERE "referenceCode" LIKE 'MDK-%';
