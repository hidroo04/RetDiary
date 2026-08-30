import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

async function main() {
  const connectionString = process.env['DATABASE_URL'];
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  console.log('🌱 Seeding database with rich dummy data...');

  const hashedPassword = await bcrypt.hash('admin123', 12);

  // 1. Akun Dosen
  const dosen = await prisma.dosen.upsert({
    where: { email: 'admin@polinela.ac.id' },
    update: {
      nama: 'Retno Wulans',
    },
    create: {
      nama: 'Retno Wulans',
      email: 'admin@polinela.ac.id',
      passwordHash: hashedPassword,
    },
  });

  console.log(`✅ Dosen terdaftar: ${dosen.nama} (${dosen.email})`);

  // Bersihkan data lama terkait dosen ini agar idempotent
  await prisma.jadwal.deleteMany({ where: { matakuliah: { dosenId: dosen.id } } });
  await prisma.fotoMateri.deleteMany({ where: { materi: { matakuliah: { dosenId: dosen.id } } } });
  await prisma.materi.deleteMany({ where: { matakuliah: { dosenId: dosen.id } } });
  await prisma.matakuliah.deleteMany({ where: { dosenId: dosen.id } });

  // 2. Data Matakuliah
  const mk1 = await prisma.matakuliah.create({
    data: {
      dosenId: dosen.id,
      nama: 'Pemrograman Web Berbasis Komponen',
      kode: 'PWK-301',
      deskripsi: 'Arsitektur web modern menggunakan React, TypeScript, State Management, dan integrasi RESTful API.',
    },
  });

  const mk2 = await prisma.matakuliah.create({
    data: {
      dosenId: dosen.id,
      nama: 'Rekayasa Perangkat Lunak',
      kode: 'RPL-204',
      deskripsi: 'Metodologi pengembangan sistem, agile software development, diagram UML, dan pengujian sistem.',
    },
  });

  const mk3 = await prisma.matakuliah.create({
    data: {
      dosenId: dosen.id,
      nama: 'Struktur Data & Algoritma',
      kode: 'SDA-102',
      deskripsi: 'Struktur data linier dan non-linier, algoritma pencarian, pengurutan, dan kompleksitas waktu.',
    },
  });

  const mk4 = await prisma.matakuliah.create({
    data: {
      dosenId: dosen.id,
      nama: 'Sistem Manajemen Basis Data',
      kode: 'SMBD-202',
      deskripsi: 'Perancangan basis data relasional, normalisasi data, SQL tingkat lanjut, indexing, dan transaksi ACID.',
    },
  });

  console.log('✅ 4 Matakuliah berhasil dibuat.');

  // 3. Data Materi
  const materiList = [
    // MK1: Pemrograman Web Berbasis Komponen
    {
      matakuliahId: mk1.id,
      judul: 'Pertemuan 1: Pengantar Ekosistem React 19 & Vite TypeScript',
      konten: 'Pembahasan arsitektur Single Page Application (SPA), Virtual DOM, setup project dengan Vite dan TypeScript strict mode.',
      urutan: 1,
    },
    {
      matakuliahId: mk1.id,
      judul: 'Pertemuan 2: Komponen UI Modular & Styling Modern CSS Module',
      konten: 'Penerapan atomic design, scoped CSS modules, variable tokens warna HSL, dan reusable button/card components.',
      urutan: 2,
    },
    {
      matakuliahId: mk1.id,
      judul: 'Pertemuan 3: State Management Terpusat Menggunakan Zustand',
      konten: 'Pengelolaan global state, persistensi local storage, auth session store, dan optimistic update.',
      urutan: 3,
    },
    {
      matakuliahId: mk1.id,
      judul: 'Pertemuan 4: Integrasi REST API & Data Fetching dengan TanStack Query',
      konten: 'Penggunaan useQuery, caching strategy, automatic re-fetch on window focus, loading state, dan error boundary handling.',
      urutan: 4,
    },
    {
      matakuliahId: mk1.id,
      judul: 'Pertemuan 5: Keamanan Autentikasi JWT & Role-Based Protected Routes',
      konten: 'Implementasi request interceptor, refresh token handling, auto-logout 401, dan route guards di React Router.',
      urutan: 5,
    },

    // MK2: Rekayasa Perangkat Lunak
    {
      matakuliahId: mk2.id,
      judul: 'Pertemuan 1: Prinsip Rekayasa Perangkat Lunak & SDLC Modern',
      konten: 'Perbandingan model Waterfall, Spiral, dan Scrum Framework pada proyek digital modern.',
      urutan: 1,
    },
    {
      matakuliahId: mk2.id,
      judul: 'Pertemuan 2: Elisitasi Kebutuhan Sistem & Penulisan User Stories',
      konten: 'Teknik wawancara stakeholder, acceptance criteria berbasis Gherkin syntax, dan prioritization matrix MoSCoW.',
      urutan: 2,
    },
    {
      matakuliahId: mk2.id,
      judul: 'Pertemuan 3: Pemodelan Sistem dengan Unified Modeling Language (UML)',
      konten: 'Pembuatan Use Case Diagram, Activity Diagram, Sequence Diagram, dan Class Diagram terstruktur.',
      urutan: 3,
    },
    {
      matakuliahId: mk2.id,
      judul: 'Pertemuan 4: Strategi Pengujian Software (Unit, Integration & E2E Testing)',
      konten: 'Penerapan Test Driven Development (TDD), mocking dependency, dan automation testing pipeline.',
      urutan: 4,
    },

    // MK3: Struktur Data & Algoritma
    {
      matakuliahId: mk3.id,
      judul: 'Pertemuan 1: Analisis Kompleksitas Algoritma (Notasi Asimtotik Big-O)',
      konten: 'Pengenalan time complexity vs space complexity, best-case, worst-case, dan average-case analysis.',
      urutan: 1,
    },
    {
      matakuliahId: mk3.id,
      judul: 'Pertemuan 2: Struktur Data Pointer & Linked List Dinamis',
      konten: 'Singly Linked List, Doubly Linked List, Circular Linked List beserta operasi traversal, insert, dan delete node.',
      urutan: 2,
    },
    {
      matakuliahId: mk3.id,
      judul: 'Pertemuan 3: Implementasi Stack LIFO & Queue FIFO',
      konten: 'Penggunaan Stack pada evaluasi ekspresi postfix dan Queue pada penjadwalan proses antrian.',
      urutan: 3,
    },

    // MK4: Sistem Manajemen Basis Data
    {
      matakuliahId: mk4.id,
      judul: 'Pertemuan 1: Desain Skema Basis Data Relasional & Entity Relationship Diagram',
      konten: 'Identifikasi entitas, relasi 1-to-1, 1-to-many, many-to-many, dan penentuan Primary/Foreign Key.',
      urutan: 1,
    },
    {
      matakuliahId: mk4.id,
      judul: 'Pertemuan 2: Teori & Penerapan Normalisasi Database (1NF sampai BCNF)',
      konten: 'Menghilangkan anomali insert, update, dan delete melalui dekomposisi tabel tanpa kehilangan data (lossless).',
      urutan: 2,
    },
    {
      matakuliahId: mk4.id,
      judul: 'Pertemuan 3: Optimalisasi Kueri SQL, Agregasi, dan Subqueries',
      konten: 'Inner join vs Outer join, CTE (Common Table Expressions), Window Functions, dan indexing B-Tree.',
      urutan: 3,
    },
  ];

  for (const m of materiList) {
    await prisma.materi.create({ data: m });
  }

  console.log(`✅ ${materiList.length} Materi berhasil dibuat.`);

  // 4. Data Jadwal (Jadwal tetap berulang setiap minggu)
  // Menyiapkan jadwal lengkap untuk berbagai hari (termasuk hari ini - Rabu)
  const jadwalList = [
    // RABU (Hari Ini)
    {
      matakuliahId: mk1.id,
      hari: 'Rabu',
      jamMulai: '08:00',
      jamSelesai: '10:30',
      ruangan: 'Lab Komputer 3',
    },
    {
      matakuliahId: mk2.id,
      hari: 'Rabu',
      jamMulai: '13:00',
      jamSelesai: '15:30',
      ruangan: 'Lab Rekayasa Perangkat Lunak',
    },
    {
      matakuliahId: mk4.id,
      hari: 'Rabu',
      jamMulai: '16:00',
      jamSelesai: '18:30',
      ruangan: 'Gedung Terpadu Lt. 2',
    },
    {
      matakuliahId: mk3.id,
      hari: 'Rabu',
      jamMulai: '19:00',
      jamSelesai: '21:00',
      ruangan: 'Ruang Teori 102',
    },

    // SENIN
    {
      matakuliahId: mk1.id,
      hari: 'Senin',
      jamMulai: '08:00',
      jamSelesai: '10:30',
      ruangan: 'Lab Komputer 2',
    },
    {
      matakuliahId: mk4.id,
      hari: 'Senin',
      jamMulai: '13:00',
      jamSelesai: '15:30',
      ruangan: 'Lab Komputer 1',
    },

    // SELASA
    {
      matakuliahId: mk3.id,
      hari: 'Selasa',
      jamMulai: '07:30',
      jamSelesai: '10:00',
      ruangan: 'Lab Informatika 1',
    },
    {
      matakuliahId: mk2.id,
      hari: 'Selasa',
      jamMulai: '10:30',
      jamSelesai: '13:00',
      ruangan: 'Ruang Teori 201',
    },

    // KAMIS
    {
      matakuliahId: mk2.id,
      hari: 'Kamis',
      jamMulai: '09:30',
      jamSelesai: '12:00',
      ruangan: 'Ruang Teori 204',
    },
    {
      matakuliahId: mk4.id,
      hari: 'Kamis',
      jamMulai: '13:30',
      jamSelesai: '16:00',
      ruangan: 'Ruang Teori 105',
    },

    // JUMAT
    {
      matakuliahId: mk3.id,
      hari: 'Jumat',
      jamMulai: '13:30',
      jamSelesai: '16:00',
      ruangan: 'Lab Multimedia',
    },
    {
      matakuliahId: mk1.id,
      hari: 'Jumat',
      jamMulai: '08:00',
      jamSelesai: '10:30',
      ruangan: 'Lab Komputer 3',
    },

    // SABTU
    {
      matakuliahId: mk1.id,
      hari: 'Sabtu',
      jamMulai: '09:00',
      jamSelesai: '11:30',
      ruangan: 'Lab Riset Cyber',
    },
  ];

  for (const j of jadwalList) {
    await prisma.jadwal.create({ data: j });
  }

  console.log(`✅ ${jadwalList.length} Jadwal kuliah berhasil dibuat.`);
  console.log('');
  console.log('🎉 Seeding database selesai dengan sukses!');
  console.log('   Email   : admin@polinela.ac.id');
  console.log('   Password: admin123');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Seed gagal:', e);
  process.exit(1);
});

