import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PdfWorkerModule } from './pdf-worker.module';

async function bootstrap() {
  await NestFactory.createApplicationContext(PdfWorkerModule);
  Logger.log('Worker konversi PDF berjalan.', 'PdfWorker');
}

void bootstrap();
