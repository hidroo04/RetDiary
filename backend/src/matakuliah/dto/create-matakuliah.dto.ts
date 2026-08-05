import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMatakuliahDto {
  @ApiProperty({ example: 'Budidaya Tanaman Perkebunan' })
  @IsString()
  @IsNotEmpty({ message: 'Nama matakuliah tidak boleh kosong' })
  @MaxLength(200)
  nama: string;

  @ApiProperty({ example: 'BTP-101' })
  @IsString()
  @IsNotEmpty({ message: 'Kode matakuliah tidak boleh kosong' })
  @MaxLength(20)
  kode: string;

  @ApiPropertyOptional({ example: 'Mempelajari teknik budidaya tanaman perkebunan unggulan.' })
  @IsOptional()
  @IsString()
  deskripsi?: string;
}
