import {
  IsIn,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const HARI_VALID = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export class CreateJadwalDto {
  @ApiProperty({ example: 'uuid-matakuliah' })
  @IsUUID()
  @IsNotEmpty()
  matakuliahId: string;

  @ApiProperty({ example: 'Senin', enum: HARI_VALID })
  @IsIn(HARI_VALID, { message: 'Hari tidak valid. Pilih salah satu dari: Senin, Selasa, Rabu, Kamis, Jumat, Sabtu.' })
  hari: string;

  @ApiProperty({ example: '08:00' })
  @Matches(/^\d{2}:\d{2}$/, { message: 'Format jam harus HH:MM (contoh: 08:00).' })
  jamMulai: string;

  @ApiProperty({ example: '09:40' })
  @Matches(/^\d{2}:\d{2}$/, { message: 'Format jam harus HH:MM (contoh: 09:40).' })
  jamSelesai: string;

  @ApiProperty({ example: 'Lab Agronomi A' })
  @IsString()
  @IsNotEmpty({ message: 'Nama ruangan tidak boleh kosong.' })
  @MaxLength(50)
  ruangan: string;
}
