import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateProgramsLevelDto } from './create-programs-level.dto';

export enum Modality {
  PRESENTIAL = 'PRESENTIAL',
  VIRTUAL = 'VIRTUAL',
  MIXED = 'MIXED'
}

export enum TitrationType {
  PROPEDEUTIC = 'PROPEDEUTIC',
  SINGLE_CYCLE = 'SINGLE_CYCLE'
}

export class CreateProgramDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  area_knowledge: string;

  @IsNotEmpty()
  @IsEnum(Modality)
  modality: string;

  @IsNotEmpty()
  @IsEnum(TitrationType)
  titration_type: string;

  @IsOptional()
  @IsBoolean()
  state?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProgramsLevelDto)
  levels: CreateProgramsLevelDto[];
}
