import { PartialType } from '@nestjs/swagger';
import { CreateMatakuliahDto } from './create-matakuliah.dto';

export class UpdateMatakuliahDto extends PartialType(CreateMatakuliahDto) {}
