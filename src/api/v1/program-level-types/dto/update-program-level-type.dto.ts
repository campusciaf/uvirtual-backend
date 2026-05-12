import { PartialType } from '@nestjs/mapped-types';
import { CreateProgramLevelTypeDto } from './create-program-level-type.dto';

export class UpdateProgramLevelTypeDto extends PartialType(CreateProgramLevelTypeDto) {}