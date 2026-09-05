import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UploadModule } from './upload/upload.module';
import { PDF_QUEUE } from './pdf/pdf.constants';
import { PdfProcessor } from './pdf/pdf.processor';
import { PdfRendererService } from './pdf/pdf-renderer.service';
import { redisConnectionFromUrl } from './pdf/redis-connection';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: redisConnectionFromUrl(
          config.get<string>('REDIS_URL', 'redis://localhost:6379'),
        ),
      }),
    }),
    BullModule.registerQueue({ name: PDF_QUEUE }),
    PrismaModule,
    UploadModule,
  ],
  providers: [PdfProcessor, PdfRendererService],
})
export class PdfWorkerModule {}
