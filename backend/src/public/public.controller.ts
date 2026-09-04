import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PublicService } from './public.service';

@ApiTags('Public')
@Controller('api/public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  // FR-01: Daftar semua matakuliah
  @Get('matakuliah')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('public_matakuliah')
  @CacheTTL(15_000)
  @ApiOperation({ summary: 'Daftar semua matakuliah (FR-01)' })
  getAllMatakuliah() {
    return this.publicService.getAllMatakuliah();
  }

  // FR-02: Detail satu matakuliah
  @Get('matakuliah/:id')
  @ApiOperation({ summary: 'Detail matakuliah (FR-02)' })
  getMatakuliahById(@Param('id') id: string) {
    return this.publicService.getMatakuliahById(id);
  }

  // FR-05, FR-06: Daftar materi per matakuliah dengan pagination
  @Get('matakuliah/:id/materi')
  @ApiOperation({
    summary: 'Daftar materi dalam matakuliah dengan pagination (FR-05, FR-06)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getMateriByMatakuliah(
    @Param('id') id: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.publicService.getMateriByMatakuliah(id, +page, +limit);
  }

  // FR-07, FR-08, FR-09: Detail satu materi
  @Get('materi/:id')
  @ApiOperation({ summary: 'Detail materi lengkap (FR-07, FR-08, FR-09)' })
  getMateriById(@Param('id') id: string) {
    return this.publicService.getMateriById(id);
  }

  // FR-28, FR-29: Rekomendasi materi berikutnya
  @Get('materi/:id/rekomendasi')
  @ApiOperation({ summary: 'Rekomendasi materi berikutnya (FR-28, FR-29)' })
  getRekomendasiMateri(@Param('id') id: string) {
    return this.publicService.getRekomendasiMateri(id);
  }

  // FR-03, FR-04: Pencarian
  @Get('search')
  @ApiOperation({ summary: 'Pencarian matakuliah dan materi (FR-03, FR-04)' })
  @ApiQuery({ name: 'q', required: true, description: 'Kata kunci pencarian' })
  search(@Query('q') q: string) {
    return this.publicService.search(q);
  }

  // FR-32: Daftar jadwal perkuliahan
  @Get('jadwal')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('public_jadwal')
  @CacheTTL(15_000)
  @ApiOperation({ summary: 'Daftar jadwal perkuliahan publik (FR-32)' })
  getAllJadwal() {
    return this.publicService.getAllJadwal();
  }
}
