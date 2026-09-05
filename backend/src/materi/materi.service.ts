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
import { randomUUID } from 'crypto';
import { PdfQueueService } from '../pdf/pdf-queue.service';

@Injectable()
export class MateriService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
    private readonly pdfQueue: PdfQueueService,
  ) {}

  // FR-17: Daftar materi per matakuliah
  async findAllByMatakuliah(matakuliahId: string, dosenId: string) {
    const mk = await this.prisma.matakuliah.findFirst({
      where: { id: matakuliahId, dosenId },
    });
    if (!mk)
      throw new ForbiddenException(
        'Matakuliah tidak ditemukan atau bukan milik Anda.',
      );

    return this.prisma.materi.findMany({
      where: { matakuliahId },
      orderBy: { urutan: 'asc' },
      select: {
        id: true,
        judul: true,
        urutan: true,
        createdAt: true,
        konten: true,
        pdfUrl: true,
        pdfStatus: true,
        pdfTotalPages: true,
        thumbnailUrl: true,
        fotoMateri: { select: { id: true, urlFoto: true, urutan: true } },
      },
    });
  }

  // Daftar seluruh materi milik dosen yang login (dengan relasi matakuliah dan foto)
  async findAllByDosen(
    dosenId: string,
    matakuliahId?: string,
    search?: string,
  ) {
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
                {
                  matakuliah: {
                    nama: { contains: search, mode: 'insensitive' },
                  },
                },
                {
                  matakuliah: {
                    kode: { contains: search, mode: 'insensitive' },
                  },
                },
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
  async create(
    dosenId: string,
    dto: CreateMateriDto,
    pdfFile?: UploadedFile,
    thumbnailFile?: UploadedFile,
  ) {
    const mk = await this.prisma.matakuliah.findFirst({
      where: { id: dto.matakuliahId, dosenId },
    });
    if (!mk)
      throw new ForbiddenException(
        'Matakuliah tidak ditemukan atau bukan milik Anda.',
      );

    // FR-22: validasi minimal ada satu jenis konten
    if (!dto.konten && !pdfFile) {
      throw new BadRequestException(
        'Materi harus memiliki konten tulisan atau berkas PDF.',
      );
    }

    let pdfUrl: string | undefined;
    let pdfVersion: string | undefined;
    let thumbnailUrl: string | undefined;
    if (pdfFile) {
      pdfUrl = await this.uploadService.savePdf(pdfFile);
      pdfVersion = randomUUID();
    }
    if (thumbnailFile) {
      thumbnailUrl = await this.uploadService.saveThumbnail(thumbnailFile);
    }

    const created = await this.prisma.materi.create({
      data: {
        matakuliahId: dto.matakuliahId,
        judul: dto.judul,
        konten: dto.konten,
        pdfUrl,
        pdfStatus: pdfFile ? 'PENDING' : 'NONE',
        pdfVersion,
        thumbnailUrl,
        urutan: dto.urutan,
      },
    });

    if (pdfUrl && pdfVersion) {
      await this.enqueuePdfOrMarkFailed(created.id, pdfUrl, pdfVersion);
    }
    return this.prisma.materi.findUniqueOrThrow({ where: { id: created.id } });
  }

  // FR-19, FR-20: Ubah materi
  async update(
    id: string,
    dosenId: string,
    dto: UpdateMateriDto,
    pdfFile?: UploadedFile,
    thumbnailFile?: UploadedFile,
  ) {
    const materi = await this.prisma.materi.findFirst({
      where: { id },
      include: { matakuliah: true },
    });
    if (!materi) throw new NotFoundException('Materi tidak ditemukan.');
    if (materi.matakuliah.dosenId !== dosenId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke materi ini.');
    }

    let pdfUrl = materi.pdfUrl;
    let pdfVersion = materi.pdfVersion;
    let thumbnailUrl = materi.thumbnailUrl;
    if (pdfFile) {
      pdfUrl = await this.uploadService.savePdf(pdfFile);
      pdfVersion = randomUUID();
    }
    if (thumbnailFile) {
      if (materi.thumbnailUrl)
        this.uploadService.deleteFoto(materi.thumbnailUrl);
      thumbnailUrl = await this.uploadService.saveThumbnail(thumbnailFile);
    }

    try {
      await this.prisma.materi.update({
        where: { id },
        data: {
          ...dto,
          pdfUrl,
          pdfVersion,
          thumbnailUrl,
          ...(pdfFile
            ? {
                pdfStatus: 'PENDING' as const,
                pdfTotalPages: null,
                pdfError: null,
              }
            : {}),
        },
      });
    } catch (error) {
      if (pdfFile && pdfUrl) this.uploadService.deletePdf(pdfUrl);
      throw error;
    }

    if (pdfFile && pdfUrl && pdfVersion) {
      await this.enqueuePdfOrMarkFailed(id, pdfUrl, pdfVersion);
      if (materi.pdfUrl && materi.pdfUrl !== pdfUrl) {
        this.uploadService.deletePdf(materi.pdfUrl);
      }
    }
    return this.prisma.materi.findUniqueOrThrow({ where: { id } });
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
    if (materi.thumbnailUrl) this.uploadService.deleteFoto(materi.thumbnailUrl);
    materi.fotoMateri.forEach((f) => this.uploadService.deleteFoto(f.urlFoto));
    await this.uploadService.deleteAllPdfPages(id);

    return this.prisma.materi.delete({ where: { id } });
  }

  async retryPdf(id: string, dosenId: string) {
    const materi = await this.prisma.materi.findFirst({
      where: { id },
      include: { matakuliah: true },
    });
    if (!materi) throw new NotFoundException('Materi tidak ditemukan.');
    if (materi.matakuliah.dosenId !== dosenId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke materi ini.');
    }
    if (!materi.pdfUrl) {
      throw new BadRequestException('Materi tidak memiliki berkas PDF.');
    }

    const pdfVersion = randomUUID();
    await this.prisma.materi.update({
      where: { id },
      data: {
        pdfVersion,
        pdfStatus: 'PENDING',
        pdfTotalPages: null,
        pdfError: null,
      },
    });
    await this.enqueuePdfOrMarkFailed(id, materi.pdfUrl, pdfVersion);
    return this.prisma.materi.findUniqueOrThrow({ where: { id } });
  }

  private async enqueuePdfOrMarkFailed(
    materiId: string,
    pdfUrl: string,
    version: string,
  ) {
    try {
      await this.pdfQueue.enqueue({ materiId, pdfUrl, version });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Antrean konversi tidak tersedia.';
      await this.prisma.materi.updateMany({
        where: { id: materiId, pdfVersion: version },
        data: { pdfStatus: 'FAILED', pdfError: message.slice(0, 1_000) },
      });
    }
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
    const lastUrutan = await this.prisma.fotoMateri.count({
      where: { materiId },
    });

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
