-- CreateTable
CREATE TABLE "public"."search_configs" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "remote" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "easyApply" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."jobs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "salary" TEXT,
    "experienceLevel" TEXT,
    "remote" TEXT,
    "jobType" TEXT,
    "easyApply" BOOLEAN NOT NULL DEFAULT false,
    "postedDate" TEXT,
    "appliedDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "jobs_url_key" ON "public"."jobs"("url");
