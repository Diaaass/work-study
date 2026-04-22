-- Add missing columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl"      TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone"          TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bio"            TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "graduationYear" INTEGER;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resumeUrl"      TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "cvExperience"   JSONB;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "cvLanguages"    JSONB;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "company"        TEXT;

-- Add missing columns to Internship table
ALTER TABLE "Internship" ADD COLUMN IF NOT EXISTS "duration"        TEXT;
ALTER TABLE "Internship" ADD COLUMN IF NOT EXISTS "deadline"        TIMESTAMP(3);
ALTER TABLE "Internship" ADD COLUMN IF NOT EXISTS "companyLogo"     TEXT;
ALTER TABLE "Internship" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
ALTER TABLE "Internship" ADD COLUMN IF NOT EXISTS "viewsCount"      INTEGER NOT NULL DEFAULT 0;

-- Add missing column to Application table
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "resumeUrl" TEXT;

-- Create TicketStatus enum if not exists
DO $$ BEGIN
  CREATE TYPE "TicketStatus" AS ENUM ('open', 'resolved');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create SupportTicket table if not exists
CREATE TABLE IF NOT EXISTS "SupportTicket" (
    "id"         SERIAL NOT NULL,
    "userId"     INTEGER NOT NULL,
    "subject"    TEXT NOT NULL,
    "message"    TEXT NOT NULL,
    "status"     "TicketStatus" NOT NULL DEFAULT 'open',
    "adminReply" TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- Create VerificationCode table if not exists
CREATE TABLE IF NOT EXISTS "VerificationCode" (
    "id"        SERIAL NOT NULL,
    "email"     TEXT NOT NULL,
    "code"      TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VerificationCode_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "VerificationCode_email_idx" ON "VerificationCode"("email");

-- Create PasswordReset table if not exists
CREATE TABLE IF NOT EXISTS "PasswordReset" (
    "id"        SERIAL NOT NULL,
    "email"     TEXT NOT NULL,
    "code"      TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PasswordReset_email_idx" ON "PasswordReset"("email");

-- Add foreign key for SupportTicket if not exists
DO $$ BEGIN
  ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
