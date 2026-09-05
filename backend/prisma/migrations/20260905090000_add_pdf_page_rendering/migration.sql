CREATE TYPE "PdfStatus" AS ENUM ('NONE', 'PENDING', 'PROCESSING', 'READY', 'FAILED');

ALTER TABLE "materi"
ADD COLUMN "pdf_status" "PdfStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN "pdf_total_pages" INTEGER,
ADD COLUMN "pdf_error" TEXT,
ADD COLUMN "pdf_version" UUID;

UPDATE "materi"
SET "pdf_status" = 'PENDING',
    "pdf_version" = gen_random_uuid()
WHERE "pdf_url" IS NOT NULL;

CREATE TABLE "materi_pages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "materi_id" UUID NOT NULL,
    "page_number" INTEGER NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "byte_size" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "materi_pages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "materi_pages_materi_id_page_number_key"
ON "materi_pages"("materi_id", "page_number");

CREATE INDEX "materi_pages_materi_id_page_number_idx"
ON "materi_pages"("materi_id", "page_number");

ALTER TABLE "materi_pages"
ADD CONSTRAINT "materi_pages_materi_id_fkey"
FOREIGN KEY ("materi_id") REFERENCES "materi"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
