# Setup

## Environment Variables

Copy `.env.example` ke `.env` dan isi sesuai konfigurasi lokal Anda.

```bash
cp .env.example .env
```

## Install Dependencies

```bash
npm install
```

## Database

Pastikan PostgreSQL berjalan, lalu jalankan migrasi dan seed:

```bash
npx prisma migrate dev
npx prisma db seed
```

## Menjalankan Server

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Documentation

Swagger tersedia di: `http://localhost:3000/api/docs`

## Akun Default (dari Seed)

| Field | Value |
|---|---|
| Email | `admin@polinela.ac.id` |
| Password | `admin123` |

> ⚠️ Ganti password setelah login pertama kali (jika fitur sudah tersedia).
