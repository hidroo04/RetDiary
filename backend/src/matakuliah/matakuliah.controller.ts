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
  create(
    @CurrentUser() user: DosenPayload,
    @Body() dto: CreateMatakuliahDto,
  ) {
    return this.matakuliahService.create(user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Ubah matakuliah (FR-15)' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: DosenPayload,
    @Body() dto: UpdateMatakuliahDto,
  ) {
    return this.matakuliahService.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus matakuliah + seluruh materi & jadwal (FR-16)' })
  remove(@Param('id') id: string, @CurrentUser() user: DosenPayload) {
    return this.matakuliahService.remove(id, user.id);
  }
}
