import { PartialType } from '@nestjs/mapped-types';
import { CreateViagenDto } from './create-viagem.dto';

export class UpdateViagenDto extends PartialType(CreateViagenDto) {}
