import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { FileFilterCallback } from 'multer';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { MatakuliahService } from './matakuliah.service';
import { CreateMatakuliahDto } from './dto/create-matakuliah.dto';
import { UpdateMatakuliahDto } from './dto/update-matakuliah.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

interface DosenPayload {
  id: string;
  email: string;
  nama: string;
}

const thumbnailUploadOptions = {
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (
    _req: Express.Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      return callback(new Error('Format thumbnail harus JPG, PNG, atau WebP.'));
    }
    callback(null, true);
  },
};

@ApiTags('Admin - Matakuliah')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/admin/matakuliah')
export class MatakuliahController {
  constructor(private readonly matakuliahService: MatakuliahService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar matakuliah milik dosen yang login (FR-13)' })
  findAll(@CurrentUser() user: DosenPayload) {
    return this.matakuliahService.findAllByDosen(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail satu matakuliah' })
  findOne(@Param('id') id: string, @CurrentUser() user: DosenPayload) {
    return this.matakuliahService.findOneByDosen(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Tambah matakuliah baru (FR-14)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('thumbnail', thumbnailUploadOptions))
  create(
    @CurrentUser() user: DosenPayload,
    @Body() dto: CreateMatakuliahDto,
    @UploadedFile() thumbnail?: Express.Multer.File,
  ) {
    return this.matakuliahService.create(user.id, dto, thumbnail as any);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Ubah matakuliah (FR-15)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('thumbnail', thumbnailUploadOptions))
  update(
    @Param('id') id: string,
    @CurrentUser() user: DosenPayload,
    @Body() dto: UpdateMatakuliahDto,
    @UploadedFile() thumbnail?: Express.Multer.File,
  ) {
    return this.matakuliahService.update(id, user.id, dto, thumbnail as any);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Hapus matakuliah + seluruh materi & jadwal (FR-16)',
  })
  remove(@Param('id') id: string, @CurrentUser() user: DosenPayload) {
    return this.matakuliahService.remove(id, user.id);
  }
}
