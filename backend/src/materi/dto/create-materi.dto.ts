import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMateriDto {
  @ApiProperty({ example: 'uuid-matakuliah' })
  @IsUUID()
  @IsNotEmpty()
  matakuliahId: string;

  @ApiProperty({ example: 'Pertemuan 1: Pengantar Budidaya Kelapa Sawit' })
  @IsString()
  @IsNotEmpty({ message: 'Judul materi tidak boleh kosong' })
  judul: string;

  @ApiPropertyOptional({
    example: 'Materi ini membahas dasar-dasar budidaya...',
  })
  @IsOptional()
  @IsString()
  konten?: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  urutan: number;
}
