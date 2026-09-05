import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as sharp from 'sharp';
import { UploadService } from '../upload/upload.service';

export interface RenderedPdfPage {
  pageNumber: number;
  imageUrl: string;
  width: number;
  height: number;
  byteSize: number;
}

@Injectable()
export class PdfRendererService {
  constructor(
    private readonly config: ConfigService,
    private readonly uploadService: UploadService,
  ) {}

  async render(
    materiId: string,
    pdfUrl: string,
    version: string,
  ): Promise<RenderedPdfPage[]> {
    const sourcePath = this.uploadService.resolveFileUrl(pdfUrl);
    const outputDirectory = await this.uploadService.preparePdfPageVersion(
      materiId,
      version,
    );
    const temporaryDirectory = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), 'retdiary-pdf-'),
    );

    try {
      const totalPages = await this.getPageCount(sourcePath);
      const maxPages = this.config.get<number>('PDF_MAX_PAGES', 300);
      if (totalPages < 1 || totalPages > maxPages) {
        throw new Error(`Jumlah halaman PDF harus antara 1 dan ${maxPages}.`);
      }

      const pages: RenderedPdfPage[] = [];
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        const prefix = path.join(temporaryDirectory, `page-${pageNumber}`);
        const pngPath = `${prefix}.png`;
        await this.run(this.config.get('PDFTOPPM_PATH', 'pdftoppm'), [
          '-f',
          String(pageNumber),
          '-l',
          String(pageNumber),
          '-singlefile',
          '-r',
          String(this.config.get<number>('PDF_RENDER_DPI', 150)),
          '-png',
          sourcePath,
          prefix,
        ]);

        const filename = `page-${String(pageNumber).padStart(4, '0')}.webp`;
        const outputPath = path.join(outputDirectory, filename);
        const image = (sharp as unknown as (input: string) => sharp.Sharp)(
          pngPath,
        );
        const metadata = await image.metadata();
        await image
          .webp({ quality: this.config.get<number>('PDF_RENDER_QUALITY', 80) })
          .toFile(outputPath);
        const stat = await fs.promises.stat(outputPath);

        pages.push({
          pageNumber,
          imageUrl: this.uploadService.getPdfPageUrl(
            materiId,
            version,
            pageNumber,
          ),
          width: metadata.width ?? 1,
          height: metadata.height ?? 1,
          byteSize: stat.size,
        });
        await fs.promises.rm(pngPath, { force: true });
      }
      return pages;
    } catch (error) {
      await this.uploadService.deletePdfPageVersion(materiId, version);
      throw error;
    } finally {
      await fs.promises.rm(temporaryDirectory, {
        recursive: true,
        force: true,
      });
    }
  }

  private async getPageCount(sourcePath: string): Promise<number> {
    const output = await this.run(this.config.get('PDFINFO_PATH', 'pdfinfo'), [
      sourcePath,
    ]);
    const match = output.match(/^Pages:\s+(\d+)\s*$/m);
    if (!match) throw new Error('Jumlah halaman PDF tidak dapat dibaca.');
    return Number(match[1]);
  }

  private run(command: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, { windowsHide: true });
      const timeout = setTimeout(
        () => {
          child.kill();
        },
        this.config.get<number>('PDF_COMMAND_TIMEOUT_MS', 60_000),
      );
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (chunk: Buffer) => {
        stdout += chunk.toString();
      });
      child.stderr.on('data', (chunk: Buffer) => {
        stderr = `${stderr}${chunk.toString()}`.slice(-4_000);
      });
      child.once('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
      child.once('close', (code) => {
        clearTimeout(timeout);
        if (code === 0) resolve(stdout);
        else
          reject(
            new Error(
              stderr ||
                `${command} gagal atau melewati batas waktu (kode ${code}).`,
            ),
          );
      });
    });
  }
}
