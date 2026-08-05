-- CreateTable
CREATE TABLE "dosen" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nama" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "dosen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matakuliah" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dosen_id" UUID NOT NULL,
    "nama" VARCHAR(200) NOT NULL,
    "kode" VARCHAR(20) NOT NULL,
    "deskripsi" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "matakuliah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materi" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "matakuliah_id" UUID NOT NULL,
    "judul" VARCHAR(300) NOT NULL,
    "konten" TEXT,
    "pdf_url" VARCHAR(500),
    "urutan" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "materi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foto_materi" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "materi_id" UUID NOT NULL,
    "url_foto" VARCHAR(500) NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "foto_materi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jadwal" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "matakuliah_id" UUID NOT NULL,
    "hari" VARCHAR(15) NOT NULL,
    "jam_mulai" VARCHAR(5) NOT NULL,
    "jam_selesai" VARCHAR(5) NOT NULL,
    "ruangan" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "jadwal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dosen_email_key" ON "dosen"("email");

-- CreateIndex
CREATE UNIQUE INDEX "matakuliah_kode_key" ON "matakuliah"("kode");

-- CreateIndex
CREATE INDEX "matakuliah_dosen_id_idx" ON "matakuliah"("dosen_id");

-- CreateIndex
CREATE INDEX "materi_matakuliah_id_idx" ON "materi"("matakuliah_id");

-- CreateIndex
CREATE INDEX "materi_matakuliah_id_urutan_idx" ON "materi"("matakuliah_id", "urutan");

-- CreateIndex
CREATE INDEX "foto_materi_materi_id_idx" ON "foto_materi"("materi_id");

-- CreateIndex
CREATE INDEX "jadwal_matakuliah_id_idx" ON "jadwal"("matakuliah_id");

-- AddForeignKey
ALTER TABLE "matakuliah" ADD CONSTRAINT "matakuliah_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "dosen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materi" ADD CONSTRAINT "materi_matakuliah_id_fkey" FOREIGN KEY ("matakuliah_id") REFERENCES "matakuliah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foto_materi" ADD CONSTRAINT "foto_materi_materi_id_fkey" FOREIGN KEY ("materi_id") REFERENCES "materi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal" ADD CONSTRAINT "jadwal_matakuliah_id_fkey" FOREIGN KEY ("matakuliah_id") REFERENCES "matakuliah"("id") ON DELETE CASCADE ON UPDATE CASCADE;
