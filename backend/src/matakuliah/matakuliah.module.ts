import { Module } from '@nestjs/common';
import { MatakuliahService } from './matakuliah.service';
import { MatakuliahController } from './matakuliah.controller';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [MatakuliahController],
  providers: [MatakuliahService],
  exports: [MatakuliahService],
})
export class MatakuliahModule {}
