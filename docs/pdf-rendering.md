# PDF rendering publik

PDF publik tidak dirender di browser. API menyimpan PDF asli, memasukkan pekerjaan ke BullMQ,
dan worker mengubah setiap halaman menjadi WebP. Frontend mengambil enam halaman per batch dan
menampilkan gambar mengikuti scroll halaman website.

## Prasyarat

- PostgreSQL sesuai konfigurasi backend.
- Redis tersedia melalui `REDIS_URL`.
- Poppler (`pdftoppm` dan `pdfinfo`) tersedia di `PATH`, atau isi `PDFTOPPM_PATH` dan
  `PDFINFO_PATH` dengan lokasi executable.

## Menjalankan lokal

1. Terapkan migration dan generate Prisma Client:
   `npx prisma migrate deploy` lalu `npx prisma generate`.
2. Jalankan Redis. Bila memakai Docker: `docker compose -f compose.redis.yml up -d redis`.
3. Jalankan API dengan `npm run start:dev`.
4. Jalankan worker di terminal terpisah dengan `npm run start:worker:dev`.

Migration menandai PDF lama sebagai `PENDING`. Saat API aktif, pekerjaan yang berstatus
`PENDING` atau `PROCESSING` akan dimasukkan kembali ke queue secara idempotent.

## Production

API dan worker harus melihat folder `uploads` yang sama. Gunakan shared persistent volume bila
keduanya berupa container terpisah. Untuk beberapa host, ganti implementasi storage lokal dengan
S3/R2 sebelum menambah replika worker.

Worker memakai concurrency 2, maksimal 300 halaman, 150 DPI, dan WebP quality 80 secara default.
Seluruh nilai tersebut dapat disesuaikan dari environment variables di `.env.example`.
