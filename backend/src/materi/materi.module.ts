import { Module } from '@nestjs/common';
import { MateriService } from './materi.service';
import { MateriController } from './materi.controller';
import { UploadModule } from '../upload/upload.module';
import { BullModule } from '@nestjs/bullmq';
import { PDF_QUEUE } from '../pdf/pdf.constants';
import { PdfQueueService } from '../pdf/pdf-queue.service';

@Module({
  imports: [UploadModule, BullModule.registerQueue({ name: PDF_QUEUE })],
  controllers: [MateriController],
  providers: [MateriService, PdfQueueService],
})
export class MateriModule {}
