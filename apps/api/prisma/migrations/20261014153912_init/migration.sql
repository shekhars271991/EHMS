-- CreateEnum
CREATE TYPE "OcularSide" AS ENUM ('OD', 'OS', 'OU');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('REGISTERED', 'OPTOMETRY_IN_PROGRESS', 'DILATING', 'DOCTOR_WAITING', 'DOCTOR_EXAM', 'INVESTIGATION', 'BILLING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OPHTHALMOLOGIST', 'OPTOMETRIST', 'NURSE', 'COUNSELOR', 'BILLING', 'PHARMACIST');

-- CreateEnum
CREATE TYPE "TonometryMethod" AS ENUM ('GOLDMANN', 'NCT', 'TONOPEN', 'PERKINS', 'ICARE');

-- CreateEnum
CREATE TYPE "SurgeryStatus" AS ENUM ('SCHEDULED', 'IN_PRE_OP', 'IN_OT', 'RECOVERY', 'DISCHARGED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "licenseNumber" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "mrn" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "idCard" JSONB,
    "emergencyContact" JSONB,
    "allergies" JSONB NOT NULL DEFAULT '[]',
    "systemicHistory" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Encounter" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT,
    "optometristId" TEXT,
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tokenNumber" INTEGER NOT NULL DEFAULT 1,
    "visitType" TEXT NOT NULL DEFAULT 'NEW',
    "status" "VisitStatus" NOT NULL DEFAULT 'REGISTERED',
    "dilatedAt" TIMESTAMP(3),
    "dilationDrops" TEXT,
    "chiefComplaint" TEXT,
    "hpi" TEXT,
    "clinicalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Encounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refraction" (
    "id" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "recordedById" TEXT NOT NULL,
    "vaData" JSONB NOT NULL,
    "refractionData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IOPRecord" (
    "id" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "measurementTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" "TonometryMethod" NOT NULL DEFAULT 'GOLDMANN',
    "iopOD" DECIMAL(4,1) NOT NULL,
    "iopOS" DECIMAL(4,1) NOT NULL,
    "pachymetryOD" DECIMAL(5,1),
    "pachymetryOS" DECIMAL(5,1),
    "correctedOD" DECIMAL(4,1),
    "correctedOS" DECIMAL(4,1),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IOPRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OphthalmicExam" (
    "id" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "anteriorSegment" JSONB NOT NULL,
    "gonioscopy" JSONB,
    "posteriorSegment" JSONB NOT NULL,
    "canvasAnnotations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OphthalmicExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncounterDiagnosis" (
    "id" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "icd10Code" TEXT NOT NULL,
    "diagnosisName" TEXT NOT NULL,
    "eye" "OcularSide" NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EncounterDiagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "generalAdvice" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionItem" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "drugName" TEXT NOT NULL,
    "eye" "OcularSide" NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "specialInstructions" TEXT,

    CONSTRAINT "PrescriptionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestigationOrder" (
    "id" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "investigationType" TEXT NOT NULL,
    "eye" "OcularSide" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ORDERED',
    "clinicalIndication" TEXT,
    "findingsSummary" TEXT,
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestigationOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurgicalBooking" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "surgeonId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "theatreRoom" TEXT,
    "eye" "OcularSide" NOT NULL,
    "procedureName" TEXT NOT NULL,
    "anaesthesiaType" TEXT NOT NULL DEFAULT 'TOPICAL',
    "status" "SurgeryStatus" NOT NULL DEFAULT 'SCHEDULED',
    "biometryData" JSONB,
    "consentSigned" BOOLEAN NOT NULL DEFAULT false,
    "consentSignatureUrl" TEXT,
    "consentTimestamp" TIMESTAMP(3),
    "preOpChecklist" JSONB NOT NULL DEFAULT '{}',
    "operativeNotes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurgicalBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "clientIp" TEXT,
    "userAgent" TEXT,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_mrn_key" ON "Patient"("mrn");

-- CreateIndex
CREATE UNIQUE INDEX "Refraction_encounterId_key" ON "Refraction"("encounterId");

-- CreateIndex
CREATE UNIQUE INDEX "OphthalmicExam_encounterId_key" ON "OphthalmicExam"("encounterId");

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_optometristId_fkey" FOREIGN KEY ("optometristId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refraction" ADD CONSTRAINT "Refraction_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refraction" ADD CONSTRAINT "Refraction_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IOPRecord" ADD CONSTRAINT "IOPRecord_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OphthalmicExam" ADD CONSTRAINT "OphthalmicExam_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OphthalmicExam" ADD CONSTRAINT "OphthalmicExam_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncounterDiagnosis" ADD CONSTRAINT "EncounterDiagnosis_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationOrder" ADD CONSTRAINT "InvestigationOrder_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurgicalBooking" ADD CONSTRAINT "SurgicalBooking_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurgicalBooking" ADD CONSTRAINT "SurgicalBooking_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurgicalBooking" ADD CONSTRAINT "SurgicalBooking_surgeonId_fkey" FOREIGN KEY ("surgeonId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
