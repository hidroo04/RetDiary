import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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

@ApiTags('Admin - Materi')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/admin')
export class MateriController {
  constructor(private readonly materiService: MateriService) {}

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
  @ApiOperation({ summary: 'Tambah materi baru dengan opsional PDF (FR-19, FR-20, FR-23)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('pdf'))
  create(
    @CurrentUser() user: DosenPayload,
    @Body() dto: CreateMateriDto,
    @UploadedFile() pdf?: Express.Multer.File,
  ) {
    return this.materiService.create(user.id, dto, pdf as any);
  }

  // FR-19, FR-20: Update materi
  @Put('materi/:id')
  @ApiOperation({ summary: 'Update materi (FR-19, FR-20)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('pdf'))
  update(
    @Param('id') id: string,
    @CurrentUser() user: DosenPayload,
    @Body() dto: UpdateMateriDto,
    @UploadedFile() pdf?: Express.Multer.File,
  ) {
    return this.materiService.update(id, user.id, dto, pdf as any);
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
