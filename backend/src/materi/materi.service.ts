import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService, UploadedFile } from '../upload/upload.service';
import { CreateMateriDto } from './dto/create-materi.dto';
import { UpdateMateriDto } from './dto/update-materi.dto';

@Injectable()
export class MateriService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  // FR-17: Daftar materi per matakuliah
  async findAllByMatakuliah(matakuliahId: string, dosenId: string) {
    const mk = await this.prisma.matakuliah.findFirst({ where: { id: matakuliahId, dosenId } });
    if (!mk) throw new ForbiddenException('Matakuliah tidak ditemukan atau bukan milik Anda.');

    return this.prisma.materi.findMany({
      where: { matakuliahId },
      orderBy: { urutan: 'asc' },
      select: {
        id: true, judul: true, urutan: true, createdAt: true,
        konten: true, pdfUrl: true,
        fotoMateri: { select: { id: true, urlFoto: true, urutan: true } },
      },
    });
  }

  // Daftar seluruh materi milik dosen yang login (dengan relasi matakuliah dan foto)
  async findAllByDosen(dosenId: string, matakuliahId?: string, search?: string) {
    return this.prisma.materi.findMany({
      where: {
        matakuliah: {
          dosenId,
          ...(matakuliahId ? { id: matakuliahId } : {}),
        },
        ...(search
          ? {
              OR: [
                { judul: { contains: search, mode: 'insensitive' } },
                { konten: { contains: search, mode: 'insensitive' } },
                { matakuliah: { nama: { contains: search, mode: 'insensitive' } } },
                { matakuliah: { kode: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: {
        matakuliah: {
          select: { id: true, nama: true, kode: true },
        },
        fotoMateri: {
          select: { id: true, urlFoto: true, urutan: true },
          orderBy: { urutan: 'asc' },
        },
      },
      orderBy: [
        { matakuliah: { nama: 'asc' } },
        { urutan: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  // Detail materi milik dosen
  async findOneByDosen(id: string, dosenId: string) {
    const materi = await this.prisma.materi.findFirst({
      where: { id, matakuliah: { dosenId } },
      include: {
        matakuliah: { select: { id: true, nama: true, kode: true } },
        fotoMateri: { orderBy: { urutan: 'asc' } },
      },
    });
    if (!materi) throw new NotFoundException('Materi tidak ditemukan.');
    return materi;
  }

  async findOne(id: string) {
    const materi = await this.prisma.materi.findUnique({
      where: { id },
      include: { fotoMateri: { orderBy: { urutan: 'asc' } } },
    });
    if (!materi) throw new NotFoundException('Materi tidak ditemukan.');
    return materi;
  }

  // FR-19, FR-22, FR-23: Tambah materi (dengan atau tanpa PDF)
  async create(dosenId: string, dto: CreateMateriDto, pdfFile?: UploadedFile) {
    const mk = await this.prisma.matakuliah.findFirst({
      where: { id: dto.matakuliahId, dosenId },
    });
    if (!mk) throw new ForbiddenException('Matakuliah tidak ditemukan atau bukan milik Anda.');

    // FR-22: validasi minimal ada satu jenis konten
    if (!dto.konten && !pdfFile) {
      throw new BadRequestException('Materi harus memiliki konten tulisan atau berkas PDF.');
    }

    let pdfUrl: string | undefined;
    if (pdfFile) {
      pdfUrl = await this.uploadService.savePdf(pdfFile);
    }

    return this.prisma.materi.create({
      data: {
        matakuliahId: dto.matakuliahId,
        judul: dto.judul,
        konten: dto.konten,
        pdfUrl,
        urutan: dto.urutan,
      },
    });
  }

  // FR-19, FR-20: Ubah materi
  async update(id: string, dosenId: string, dto: UpdateMateriDto, pdfFile?: UploadedFile) {
    const materi = await this.prisma.materi.findFirst({
      where: { id },
      include: { matakuliah: true },
    });
    if (!materi) throw new NotFoundException('Materi tidak ditemukan.');
    if (materi.matakuliah.dosenId !== dosenId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke materi ini.');
    }

    let pdfUrl = materi.pdfUrl;
    if (pdfFile) {
      if (materi.pdfUrl) this.uploadService.deletePdf(materi.pdfUrl);
      pdfUrl = await this.uploadService.savePdf(pdfFile);
    }

    return this.prisma.materi.update({
      where: { id },
      data: { ...dto, pdfUrl },
    });
  }

  // FR-18: Hapus materi
  async remove(id: string, dosenId: string) {
    const materi = await this.prisma.materi.findFirst({
      where: { id },
      include: { matakuliah: true, fotoMateri: true },
    });
    if (!materi) throw new NotFoundException('Materi tidak ditemukan.');
    if (materi.matakuliah.dosenId !== dosenId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke materi ini.');
    }

    // Hapus file fisik sebelum hapus record DB
    if (materi.pdfUrl) this.uploadService.deletePdf(materi.pdfUrl);
    materi.fotoMateri.forEach((f) => this.uploadService.deleteFoto(f.urlFoto));

    return this.prisma.materi.delete({ where: { id } });
  }

  // FR-21: Upload foto pendukung
  async uploadFoto(materiId: string, dosenId: string, files: UploadedFile[]) {
    const materi = await this.prisma.materi.findFirst({
      where: { id: materiId },
      include: { matakuliah: true },
    });
    if (!materi) throw new NotFoundException('Materi tidak ditemukan.');
    if (materi.matakuliah.dosenId !== dosenId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke materi ini.');
    }

    const savedFotos = await Promise.all(
      files.map((file) => this.uploadService.saveFoto(file)),
    );

    // Simpan URL thumbnail ke DB (medium/original bisa digunakan via konvensi URL)
    const lastUrutan = await this.prisma.fotoMateri.count({ where: { materiId } });

    return this.prisma.$transaction(
      savedFotos.map((foto, idx) =>
        this.prisma.fotoMateri.create({
          data: {
            materiId,
            urlFoto: foto.medium, // simpan medium sebagai default
            urutan: lastUrutan + idx + 1,
          },
        }),
      ),
    );
  }

  // FR-21: Hapus satu foto
  async deleteFoto(fotoId: string, dosenId: string) {
    const foto = await this.prisma.fotoMateri.findUnique({
      where: { id: fotoId },
      include: { materi: { include: { matakuliah: true } } },
    });
    if (!foto) throw new NotFoundException('Foto tidak ditemukan.');
    if (foto.materi.matakuliah.dosenId !== dosenId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke foto ini.');
    }

    this.uploadService.deleteFoto(foto.urlFoto);
    return this.prisma.fotoMateri.delete({ where: { id: fotoId } });
  }
}
