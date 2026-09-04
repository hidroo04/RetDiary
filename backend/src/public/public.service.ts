import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  // FR-01: Daftar semua matakuliah
  async getAllMatakuliah() {
    return this.prisma.matakuliah.findMany({
      orderBy: { nama: 'asc' },
      select: {
        id: true,
        nama: true,
        kode: true,
        deskripsi: true,
        thumbnailUrl: true,
      },
    });
  }

  // FR-02: Detail satu matakuliah
  async getMatakuliahById(id: string) {
    const mk = await this.prisma.matakuliah.findUnique({
      where: { id },
      select: {
        id: true,
        nama: true,
        kode: true,
        deskripsi: true,
        thumbnailUrl: true,
      },
    });
    if (!mk) throw new NotFoundException('Matakuliah tidak ditemukan.');
    return mk;
  }

  // FR-05, FR-06: Daftar materi per matakuliah (pagination untuk infinite scroll)
  async getMateriByMatakuliah(
    matakuliahId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    const [total, materi] = await Promise.all([
      this.prisma.materi.count({ where: { matakuliahId } }),
      this.prisma.materi.findMany({
        where: { matakuliahId },
        orderBy: { urutan: 'asc' },
        skip,
        take: limit,
        select: {
          id: true,
          judul: true,
          urutan: true,
          createdAt: true,
          konten: true,
          pdfUrl: true,
          thumbnailUrl: true,
          fotoMateri: {
            orderBy: { urutan: 'asc' },
            select: { id: true, urlFoto: true },
          },
        },
      }),
    ]);

    return {
      data: materi,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + limit < total,
      },
    };
  }

  // FR-07, FR-08, FR-09: Detail satu materi
  async getMateriById(id: string) {
    const materi = await this.prisma.materi.findUnique({
      where: { id },
      select: {
        id: true,
        judul: true,
        konten: true,
        pdfUrl: true,
        thumbnailUrl: true,
        urutan: true,
        createdAt: true,
        matakuliah: {
          select: { id: true, nama: true, kode: true, thumbnailUrl: true },
        },
        fotoMateri: {
          orderBy: { urutan: 'asc' },
          select: { id: true, urlFoto: true, urutan: true },
        },
      },
    });
    if (!materi) throw new NotFoundException('Materi tidak ditemukan.');
    return materi;
  }

  // FR-28: Rekomendasi materi berikutnya berdasarkan urutan
  async getRekomendasiMateri(materiId: string) {
    const materi = await this.prisma.materi.findUnique({
      where: { id: materiId },
    });
    if (!materi) throw new NotFoundException('Materi tidak ditemukan.');

    const next = await this.prisma.materi.findFirst({
      where: {
        matakuliahId: materi.matakuliahId,
        urutan: { gt: materi.urutan },
      },
      orderBy: { urutan: 'asc' },
      select: { id: true, judul: true, urutan: true },
    });

    // FR-29: Jika materi terakhir, kembalikan null dan flag isLast
    return {
      rekomendasi: next,
      isLast: next === null,
    };
  }

  // FR-03, FR-04: Pencarian matakuliah dan materi
  async search(q: string) {
    const keyword = q?.trim();
    if (!keyword) return { matakuliah: [], materi: [] };

    const [matakuliah, materi] = await Promise.all([
      this.prisma.matakuliah.findMany({
        where: {
          OR: [
            { nama: { contains: keyword, mode: 'insensitive' } },
            { kode: { contains: keyword, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          nama: true,
          kode: true,
          deskripsi: true,
          thumbnailUrl: true,
        },
        take: 10,
      }),
      this.prisma.materi.findMany({
        where: { judul: { contains: keyword, mode: 'insensitive' } },
        select: {
          id: true,
          judul: true,
          urutan: true,
          thumbnailUrl: true,
          matakuliah: { select: { id: true, nama: true } },
        },
        take: 10,
      }),
    ]);

    return { matakuliah, materi };
  }

  // FR-32: Daftar jadwal perkuliahan (publik)
  async getAllJadwal() {
    return this.prisma.jadwal.findMany({
      orderBy: [{ hari: 'asc' }, { jamMulai: 'asc' }],
      include: {
        matakuliah: { select: { id: true, nama: true, kode: true } },
      },
    });
  }
}
