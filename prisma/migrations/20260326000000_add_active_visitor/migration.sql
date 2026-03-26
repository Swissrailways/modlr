-- CreateTable
CREATE TABLE "ActiveVisitor" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActiveVisitor_pkey" PRIMARY KEY ("id")
);
