-- AlterTable
ALTER TABLE "Shop" ADD COLUMN "selectedProductTemplateId" TEXT;

-- CreateTable
CREATE TABLE "ProductTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mockupImage" TEXT,
    "printAreaX" INTEGER NOT NULL,
    "printAreaY" INTEGER NOT NULL,
    "printAreaWidth" INTEGER NOT NULL,
    "printAreaHeight" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductTemplate_key_key" ON "ProductTemplate"("key");
