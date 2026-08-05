import { PartialType } from '@nestjs/swagger';
import { CreateMateriDto } from './create-materi.dto';

export class UpdateMateriDto extends PartialType(CreateMateriDto) {}
