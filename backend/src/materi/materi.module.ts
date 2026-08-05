import { Module } from '@nestjs/common';
import { MateriService } from './materi.service';
import { MateriController } from './materi.controller';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [MateriController],
  providers: [MateriService],
})
export class MateriModule {}
