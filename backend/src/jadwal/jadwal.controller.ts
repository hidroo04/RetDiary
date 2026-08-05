import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JadwalService } from './jadwal.service';
import { CreateJadwalDto } from './dto/create-jadwal.dto';
import { UpdateJadwalDto } from './dto/update-jadwal.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

interface DosenPayload {
  id: string;
  email: string;
  nama: string;
}

@ApiTags('Admin - Jadwal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/admin/jadwal')
export class JadwalController {
  constructor(private readonly jadwalService: JadwalService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar jadwal milik dosen yang login (FR-33)' })
  findAll(@CurrentUser() user: DosenPayload) {
    return this.jadwalService.findAllByDosen(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Tambah jadwal baru (FR-34)' })
  create(@CurrentUser() user: DosenPayload, @Body() dto: CreateJadwalDto) {
    return this.jadwalService.create(user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Ubah jadwal (FR-35)' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: DosenPayload,
    @Body() dto: UpdateJadwalDto,
  ) {
    return this.jadwalService.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus jadwal (FR-36)' })
  remove(@Param('id') id: string, @CurrentUser() user: DosenPayload) {
    return this.jadwalService.remove(id, user.id);
  }
}
