import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJadwalDto } from './dto/create-jadwal.dto';
import { UpdateJadwalDto } from './dto/update-jadwal.dto';

@Injectable()
export class JadwalService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // FR-33: Daftar jadwal (admin)
  async findAllByDosen(dosenId: string) {
    return this.prisma.jadwal.findMany({
      where: { matakuliah: { dosenId } },
      orderBy: [{ hari: 'asc' }, { jamMulai: 'asc' }],
      include: {
        matakuliah: { select: { id: true, nama: true, kode: true } },
      },
    });
  }

  // FR-34: Tambah jadwal
  async create(dosenId: string, dto: CreateJadwalDto) {
    const mk = await this.prisma.matakuliah.findFirst({
      where: { id: dto.matakuliahId, dosenId },
    });
    if (!mk) {
      throw new ForbiddenException(
        'Matakuliah tidak ditemukan atau bukan milik Anda.',
      );
    }

    const result = await this.prisma.jadwal.create({ data: dto });

    // Invalidate public caches
    await this.cacheManager.del('public_jadwal');

    return result;
  }

  // FR-35: Ubah jadwal
  async update(id: string, dosenId: string, dto: UpdateJadwalDto) {
    const jadwal = await this.prisma.jadwal.findFirst({
      where: { id },
      include: { matakuliah: true },
    });
    if (!jadwal) throw new NotFoundException('Jadwal tidak ditemukan.');
    if (jadwal.matakuliah.dosenId !== dosenId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke jadwal ini.');
    }

    const result = await this.prisma.jadwal.update({
      where: { id },
      data: dto,
    });

    // Invalidate public caches
    await this.cacheManager.del('public_jadwal');

    return result;
  }

  // FR-36: Hapus jadwal
  async remove(id: string, dosenId: string) {
    const jadwal = await this.prisma.jadwal.findFirst({
      where: { id },
      include: { matakuliah: true },
    });
    if (!jadwal) throw new NotFoundException('Jadwal tidak ditemukan.');
    if (jadwal.matakuliah.dosenId !== dosenId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke jadwal ini.');
    }

    const result = await this.prisma.jadwal.delete({ where: { id } });

    // Invalidate public caches
    await this.cacheManager.del('public_jadwal');

    return result;
  }
}
