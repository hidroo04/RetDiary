import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import type { FileFilterCallback } from 'multer';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { MateriService } from './materi.service';
import { CreateMateriDto } from './dto/create-materi.dto';
import { UpdateMateriDto } from './dto/update-materi.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

interface DosenPayload {
  id: string;
  email: string;
  nama: string;
}

const materiUploadOptions = {
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (
    _req: Express.Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ) => {
    if (file.fieldname === 'pdf' && file.mimetype !== 'application/pdf') {
      return callback(new BadRequestException('Berkas harus berformat PDF.'));
    }
    if (
      file.fieldname === 'thumbnail' &&
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)
    ) {
      return callback(
        new BadRequestException('Format thumbnail harus JPG, PNG, atau WebP.'),
      );
    }
    callback(null, true);
  },
};

type MateriUploadFiles = {
  pdf?: Express.Multer.File[];
  thumbnail?: Express.Multer.File[];
};

@ApiTags('Admin - Materi')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/admin')
export class MateriController {
  constructor(private readonly materiService: MateriService) {}

  // Daftar semua materi milik dosen yang login
  @Get('materi')
  @ApiOperation({ summary: 'Daftar semua materi milik dosen yang login' })
  findAllDosen(
    @CurrentUser() user: DosenPayload,
    @Query('matakuliahId') matakuliahId?: string,
    @Query('search') search?: string,
  ) {
    return this.materiService.findAllByDosen(user.id, matakuliahId, search);
  }

  // Detail satu materi milik dosen
  @Get('materi/:id')
  @ApiOperation({ summary: 'Detail satu materi milik dosen' })
  findOne(@Param('id') id: string, @CurrentUser() user: DosenPayload) {
    return this.materiService.findOneByDosen(id, user.id);
  }

  // FR-17: Daftar materi per matakuliah (admin)
  @Get('matakuliah/:matakuliahId/materi')
  @ApiOperation({ summary: 'Daftar materi dalam satu matakuliah (FR-17)' })
  findAll(
    @Param('matakuliahId') matakuliahId: string,
    @CurrentUser() user: DosenPayload,
  ) {
    return this.materiService.findAllByMatakuliah(matakuliahId, user.id);
  }

  // FR-19, FR-20, FR-22, FR-23: Tambah materi
  @Post('materi')
  @ApiOperation({
    summary: 'Tambah materi baru dengan opsional PDF (FR-19, FR-20, FR-23)',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'pdf', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
      ],
      materiUploadOptions,
    ),
  )
  create(
    @CurrentUser() user: DosenPayload,
    @Body() dto: CreateMateriDto,
    @UploadedFiles() files?: MateriUploadFiles,
  ) {
    return this.materiService.create(
      user.id,
      dto,
      files?.pdf?.[0] as any,
      files?.thumbnail?.[0] as any,
    );
  }

  // FR-19, FR-20: Update materi
  @Put('materi/:id')
  @ApiOperation({ summary: 'Update materi (FR-19, FR-20)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'pdf', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
      ],
      materiUploadOptions,
    ),
  )
  update(
    @Param('id') id: string,
    @CurrentUser() user: DosenPayload,
    @Body() dto: UpdateMateriDto,
    @UploadedFiles() files?: MateriUploadFiles,
  ) {
    return this.materiService.update(
      id,
      user.id,
      dto,
      files?.pdf?.[0] as any,
      files?.thumbnail?.[0] as any,
    );
  }

  // FR-18: Hapus materi
  @Delete('materi/:id')
  @ApiOperation({ summary: 'Hapus materi (FR-18)' })
  remove(@Param('id') id: string, @CurrentUser() user: DosenPayload) {
    return this.materiService.remove(id, user.id);
  }

  // FR-21: Upload foto pendukung (maks 10 foto sekaligus)
  @Post('materi/:id/foto')
  @ApiOperation({ summary: 'Upload foto pendukung materi (FR-21)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('foto', 10))
  uploadFoto(
    @Param('id') id: string,
    @CurrentUser() user: DosenPayload,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.materiService.uploadFoto(id, user.id, files as any);
  }

  // FR-21: Hapus satu foto
  @Delete('foto/:id')
  @ApiOperation({ summary: 'Hapus satu foto pendukung (FR-21)' })
  deleteFoto(@Param('id') id: string, @CurrentUser() user: DosenPayload) {
    return this.materiService.deleteFoto(id, user.id);
  }
}
