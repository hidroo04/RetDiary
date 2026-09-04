# Panduan Penulisan Kode

Proyek ini menggunakan Prettier agar kode mudah dibaca dan perubahan format tetap konsisten.

## Aturan utama

- Batasi panjang baris hingga sekitar 100 karakter.
- Tulis JSX bertingkat pada beberapa baris. Satu elemen, atribut, atau ekspresi kompleks tidak perlu dipadatkan ke dalam satu baris.
- Tulis setiap deklarasi CSS pada baris tersendiri di dalam blok selector.
- Gunakan nama fungsi dan variabel yang menjelaskan tujuan. Tambahkan komentar hanya untuk alasan bisnis atau perilaku yang tidak langsung terlihat dari kode.
- Jangan memformat berkas hasil kompilasi, dependensi, unggahan, atau lockfile.

## Menjalankan formatter

Dari direktori utama proyek, jalankan:

```powershell
& backend/node_modules/.bin/prettier.cmd --write `
  "backend/src/**/*.ts" `
  "backend/test/**/*.ts" `
  "frontend-admin/src/**/*.{ts,tsx,css}" `
  "frontend-publik/src/**/*.{ts,tsx,css}"
```

Untuk memeriksa format tanpa mengubah berkas, ganti `--write` dengan `--check`.
