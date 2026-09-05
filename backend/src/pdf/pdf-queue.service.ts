import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { PDF_JOB, PDF_QUEUE, PdfConversionJob } from './pdf.constants';

@Injectable()
export class PdfQueueService implements OnModuleInit {
  private readonly logger = new Logger(PdfQueueService.name);

  constructor(
    @InjectQueue(PDF_QUEUE)
    private readonly queue: Queue<PdfConversionJob>,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    const pending = await this.prisma.materi.findMany({
      where: {
        pdfUrl: { not: null },
        pdfVersion: { not: null },
        pdfStatus: { in: ['PENDING', 'PROCESSING'] },
      },
      select: { id: true, pdfUrl: true, pdfVersion: true },
    });

    await Promise.all(
      pending.map((materi) =>
        this.enqueue({
          materiId: materi.id,
          pdfUrl: materi.pdfUrl!,
          version: materi.pdfVersion!,
        }),
      ),
    );

    if (pending.length) {
      this.logger.log(`Menjadwalkan ulang ${pending.length} konversi PDF.`);
    }
  }

  enqueue(data: PdfConversionJob) {
    return this.queue.add(PDF_JOB, data, {
      jobId: `${PDF_JOB}-${data.materiId}-${data.version}`,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2_000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 100 },
    });
  }
}
