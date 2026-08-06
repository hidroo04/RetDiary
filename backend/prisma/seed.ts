import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

async function main() {
  const connectionString = process.env['DATABASE_URL'];
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('admin123', 12);

  const dosen = await prisma.dosen.upsert({
    where: { email: 'admin@polinela.ac.id' },
    update: {}, // jika sudah ada, tidak mengubah apapun
    create: {
      nama: 'Admin Dosen',
      email: 'admin@polinela.ac.id',
      passwordHash: hashedPassword,
    },
  });

  console.log('✅ Akun dosen berhasil dibuat:');
  console.log(`   - Nama  : ${dosen.nama}`);
  console.log(`   - Email : ${dosen.email}`);
  console.log(`   - ID    : ${dosen.id}`);
  console.log('');
  console.log('⚠️  Password default: admin123');
  console.log('   Segera ganti setelah login pertama kali.');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Seed gagal:', e);
  process.exit(1);
});
