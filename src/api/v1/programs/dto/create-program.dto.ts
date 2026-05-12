import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
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

@ValidatorConstraint({ name: 'LevelsCreditsByTitration', async: false })
export class LevelsCreditsByTitrationConstraint implements ValidatorConstraintInterface {
  validate(levels: any, args: ValidationArguments) {
    const obj = args.object as any;
    if (!Array.isArray(levels)) return false;
    if (obj.titration_type === 'SINGLE_CYCLE') return true;
    return levels.every(l => Number.isInteger(l?.total_credits) && l.total_credits >= 1);
  }
  defaultMessage() {
    return 'El total de créditos debe ser mayor o igual a 1.';
  }
}

export class CreateProgramDto {
  @IsNotEmpty({ message: 'El código es obligatorio.' })
  @IsString({ message: 'El código debe ser un texto.' })
  code: string;

  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @IsString({ message: 'El nombre debe ser un texto.' })
  name: string;

  @IsNotEmpty({ message: 'El área de conocimiento es obligatoria.' })
  @IsString({ message: 'El área de conocimiento debe ser un texto.' })
  area_knowledge: string;

  @IsNotEmpty({ message: 'La modalidad es obligatoria.' })
  @IsEnum(Modality, { message: 'La modalidad no es válida.' })
  modality: string;

  @IsNotEmpty({ message: 'El tipo de titulación es obligatorio.' })
  @IsEnum(TitrationType, { message: 'El tipo de titulación no es válido.' })
  titration_type: string;

  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser verdadero o falso.' })
  state?: boolean;

  @IsArray({ message: 'Los niveles deben ser una lista.' })
  @ValidateNested({ each: true })
  @Type(() => CreateProgramsLevelDto)
  @Validate(LevelsCreditsByTitrationConstraint)
  levels: CreateProgramsLevelDto[];
}