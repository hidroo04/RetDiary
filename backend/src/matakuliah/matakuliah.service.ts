import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatakuliahDto } from './dto/create-matakuliah.dto';
import { UpdateMatakuliahDto } from './dto/update-matakuliah.dto';

@Injectable()
export class MatakuliahService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // FR-13: Daftar matakuliah milik dosen yang login
  async findAllByDosen(dosenId: string) {
    return this.prisma.matakuliah.findMany({
      where: { dosenId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, nama: true, kode: true, deskripsi: true, createdAt: true },
    });
  }

  async findOneByDosen(id: string, dosenId: string) {
    const matakuliah = await this.prisma.matakuliah.findFirst({
      where: { id, dosenId },
    });
    if (!matakuliah) {
      throw new NotFoundException('Matakuliah tidak ditemukan.');
    }
    return matakuliah;
  }

  // FR-14: Tambah matakuliah
  async create(dosenId: string, dto: CreateMatakuliahDto) {
    // FR-14A: Kode matakuliah harus unik
    const existing = await this.prisma.matakuliah.findUnique({
      where: { kode: dto.kode },
    });
    if (existing) {
      throw new ConflictException('Kode matakuliah sudah digunakan.');
    }
    const result = await this.prisma.matakuliah.create({
      data: { ...dto, dosenId },
    });
    
    // Invalidate public caches
    await this.cacheManager.del('public_matakuliah');
    await this.cacheManager.del('public_jadwal');
    
    return result;
  }

  // FR-15: Ubah matakuliah
  async update(id: string, dosenId: string, dto: UpdateMatakuliahDto) {
    await this.findOneByDosen(id, dosenId);

    if (dto.kode) {
      const existing = await this.prisma.matakuliah.findFirst({
        where: { kode: dto.kode, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Kode matakuliah sudah digunakan.');
      }
    }

    const result = await this.prisma.matakuliah.update({
      where: { id },
      data: dto,
    });

    // Invalidate public caches
    await this.cacheManager.del('public_matakuliah');
    await this.cacheManager.del('public_jadwal');

    return result;
  }

  // FR-16: Hapus matakuliah (cascade ke materi & jadwal via DB)
  async remove(id: string, dosenId: string) {
    const matakuliah = await this.prisma.matakuliah.findFirst({ where: { id } });
    if (!matakuliah) {
      throw new NotFoundException('Matakuliah tidak ditemukan.');
    }
    if (matakuliah.dosenId !== dosenId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke matakuliah ini.');
    }
    
    const result = await this.prisma.matakuliah.delete({ where: { id } });

    // Invalidate public caches
    await this.cacheManager.del('public_matakuliah');
    await this.cacheManager.del('public_jadwal');

    return result;
  }
}
