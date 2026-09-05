import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { PDF_QUEUE, PdfConversionJob } from './pdf.constants';
import { PdfRendererService } from './pdf-renderer.service';
import { UploadService } from '../upload/upload.service';

@Processor(PDF_QUEUE, { concurrency: 2 })
export class PdfProcessor extends WorkerHost {
  private readonly logger = new Logger(PdfProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly renderer: PdfRendererService,
    private readonly uploadService: UploadService,
  ) {
    super();
  }

  async process(job: Job<PdfConversionJob>) {
    const { materiId, pdfUrl, version } = job.data;
    const claimed = await this.prisma.materi.updateMany({
      where: { id: materiId, pdfVersion: version },
      data: { pdfStatus: 'PROCESSING', pdfError: null },
    });
    if (!claimed.count) return { stale: true };

    try {
      const pages = await this.renderer.render(materiId, pdfUrl, version);
      const previousPages = await this.prisma.materiPage.findMany({
        where: { materiId },
        select: { imageUrl: true },
      });
      const committed = await this.prisma.$transaction(async (tx) => {
        const current = await tx.materi.findUnique({
          where: { id: materiId },
          select: { pdfVersion: true },
        });
        if (current?.pdfVersion !== version) return false;

        await tx.materiPage.deleteMany({ where: { materiId } });
        await tx.materiPage.createMany({
          data: pages.map((page) => ({ materiId, ...page })),
        });
        await tx.materi.update({
          where: { id: materiId },
          data: {
            pdfStatus: 'READY',
            pdfTotalPages: pages.length,
            pdfError: null,
          },
        });
        return true;
      });

      if (!committed) {
        await this.uploadService.deletePdfPageVersion(materiId, version);
        return { stale: true };
      }
      await this.uploadService.deletePdfPageUrls(
        previousPages
          .map((page) => page.imageUrl)
          .filter((imageUrl) => !imageUrl.includes(`/${version}/`)),
      );
      this.logger.log(
        `PDF materi ${materiId} selesai: ${pages.length} halaman.`,
      );
      return { totalPages: pages.length };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Konversi PDF gagal.';
      const isLastAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
      await this.prisma.materi.updateMany({
        where: { id: materiId, pdfVersion: version },
        data: {
          pdfStatus: isLastAttempt ? 'FAILED' : 'PENDING',
          pdfError: message.slice(0, 1_000),
        },
      });
      throw error;
    }
  }
}
