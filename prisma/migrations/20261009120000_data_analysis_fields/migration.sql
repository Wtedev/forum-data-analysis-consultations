-- Replace academic stage values with data-analysis stages.
-- Existing rows are mapped to INDIVIDUAL so the column stays valid.
BEGIN;
CREATE TYPE "CurrentStage_new" AS ENUM ('INDIVIDUAL', 'RESEARCHER', 'EMPLOYEE', 'BUSINESS_OWNER', 'OTHER');
ALTER TABLE "Consultation" ALTER COLUMN "currentStage" TYPE "CurrentStage_new" USING (
  CASE "currentStage"::text
    WHEN 'HIGH_SCHOOL' THEN 'INDIVIDUAL'
    WHEN 'NEW_UNIVERSITY_STUDENT' THEN 'INDIVIDUAL'
    WHEN 'UNIVERSITY_STUDENT' THEN 'INDIVIDUAL'
    ELSE 'OTHER'
  END::"CurrentStage_new"
);
ALTER TYPE "CurrentStage" RENAME TO "CurrentStage_old";
ALTER TYPE "CurrentStage_new" RENAME TO "CurrentStage";
DROP TYPE "CurrentStage_old";
COMMIT;

-- Replace academic consultation types. Unmapped values become OTHER.
BEGIN;
CREATE TYPE "ConsultationType_new" AS ENUM ('STATISTICAL_ANALYSIS', 'DATA_CLEANING', 'DASHBOARDS_AND_REPORTS', 'SURVEY_DESIGN', 'TOOL_SELECTION', 'RESULTS_INTERPRETATION', 'OTHER');
ALTER TABLE "Consultation" ALTER COLUMN "consultationType" TYPE "ConsultationType_new" USING ('OTHER'::"ConsultationType_new");
ALTER TYPE "ConsultationType" RENAME TO "ConsultationType_old";
ALTER TYPE "ConsultationType_new" RENAME TO "ConsultationType";
DROP TYPE "ConsultationType_old";
COMMIT;

ALTER TABLE "Consultation" ADD COLUMN "tools" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Consultation" ADD COLUMN "link" TEXT;
