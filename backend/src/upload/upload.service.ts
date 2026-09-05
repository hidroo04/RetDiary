import { Injectable, BadRequestException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class UploadService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly maxPdfSize = 10 * 1024 * 1024; // 10MB
  private readonly maxImgSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedImgMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  constructor() {
    // Pastikan folder uploads ada
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    [
      'pdf',
      'pdf-pages',
      'thumbnail',
      'foto/thumbnail',
      'foto/medium',
      'foto/original',
    ].forEach((sub) => {
      const dir = path.join(this.uploadDir, sub);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
  }

  // FR-20: Upload & validasi PDF
  async savePdf(file: UploadedFile): Promise<string> {
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Berkas harus berformat PDF.');
    }
    if (file.size > this.maxPdfSize) {
      throw new BadRequestException('Ukuran PDF maksimum 10MB.');
    }
    if (file.buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
      throw new BadRequestException('Isi berkas bukan dokumen PDF yang valid.');
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`;
    const filepath = path.join(this.uploadDir, 'pdf', filename);
    await fs.promises.writeFile(filepath, file.buffer);
    return `/uploads/pdf/${filename}`;
  }

  // FR-21, NFR-1.4: Upload, resize, dan konversi foto ke WebP
  async saveFoto(
    file: UploadedFile,
  ): Promise<{ thumbnail: string; medium: string; original: string }> {
    if (!this.allowedImgMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Format foto harus JPG, PNG, atau WebP.');
    }
    if (file.size > this.maxImgSize) {
      throw new BadRequestException('Ukuran foto maksimum 5MB.');
    }

    const baseName = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const [thumbnail, medium, original] = await Promise.all([
      this.resizeAndSave(file.buffer, baseName, 'thumbnail', 300),
      this.resizeAndSave(file.buffer, baseName, 'medium', 800),
      this.resizeAndSave(file.buffer, baseName, 'original', 1920),
    ]);

    return { thumbnail, medium, original };
  }

  async saveThumbnail(file: UploadedFile): Promise<string> {
    if (!this.allowedImgMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Format thumbnail harus JPG, PNG, atau WebP.',
      );
    }
    if (file.size > this.maxImgSize) {
      throw new BadRequestException('Ukuran thumbnail maksimum 5MB.');
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
    const filepath = path.join(this.uploadDir, 'thumbnail', filename);
    await (sharp as unknown as (buf: Buffer) => sharp.Sharp)(file.buffer)
      .resize(800, 450, { fit: 'cover', position: 'centre' })
      .webp({ quality: 82 })
      .toFile(filepath);
    return `/uploads/thumbnail/${filename}`;
  }

  private async resizeAndSave(
    buffer: Buffer,
    baseName: string,
    size: string,
    width: number,
  ): Promise<string> {
    const filename = `${baseName}-${size}.webp`;
    const filepath = path.join(this.uploadDir, 'foto', size, filename);
    await (sharp as unknown as (buf: Buffer) => sharp.Sharp)(buffer)
      .resize(width, undefined, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(filepath);
    return `/uploads/foto/${size}/${filename}`;
  }

  deleteFoto(urlFoto: string) {
    const relativePath = urlFoto.replace('/uploads/', '');
    const fullPath = path.join(this.uploadDir, relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  deletePdf(pdfUrl: string) {
    const relativePath = pdfUrl.replace('/uploads/', '');
    const fullPath = path.join(this.uploadDir, relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  resolveFileUrl(fileUrl: string): string {
    const relativePath = fileUrl.replace(/^\/?uploads\//, '');
    const fullPath = path.resolve(this.uploadDir, relativePath);
    const relativeToUploads = path.relative(this.uploadDir, fullPath);
    if (
      relativeToUploads.startsWith('..') ||
      path.isAbsolute(relativeToUploads)
    ) {
      throw new BadRequestException('Lokasi berkas tidak valid.');
    }
    return fullPath;
  }

  async preparePdfPageVersion(
    materiId: string,
    version: string,
  ): Promise<string> {
    const directory = path.join(this.uploadDir, 'pdf-pages', materiId, version);
    await fs.promises.rm(directory, { recursive: true, force: true });
    await fs.promises.mkdir(directory, { recursive: true });
    return directory;
  }

  getPdfPageUrl(materiId: string, version: string, pageNumber: number): string {
    return `/uploads/pdf-pages/${materiId}/${version}/page-${String(pageNumber).padStart(4, '0')}.webp`;
  }

  async deletePdfPageVersion(materiId: string, version: string): Promise<void> {
    const directory = path.join(this.uploadDir, 'pdf-pages', materiId, version);
    await fs.promises.rm(directory, { recursive: true, force: true });
  }

  async deleteAllPdfPages(materiId: string): Promise<void> {
    const directory = path.join(this.uploadDir, 'pdf-pages', materiId);
    await fs.promises.rm(directory, { recursive: true, force: true });
  }

  async deletePdfPageUrls(imageUrls: string[]): Promise<void> {
    const directories = new Set(
      imageUrls.map((imageUrl) => path.dirname(this.resolveFileUrl(imageUrl))),
    );
    await Promise.all(
      [...directories].map((directory) =>
        fs.promises.rm(directory, { recursive: true, force: true }),
      ),
    );
  }
}
