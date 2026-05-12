import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateIf } from 'class-validator';

export class CreateProgramsLevelDto {
  @IsNotEmpty({ message: 'El nivel es obligatorio.' })
  @IsString({ message: 'El nivel debe ser un texto.' })
  level: string;

  @IsNotEmpty({ message: 'El orden del nivel es obligatorio.' })
  @IsInt({ message: 'El orden debe ser un número entero.' })
  @Min(1, { message: 'El orden debe ser mayor o igual a 1.' })
  order: number;

  @IsNotEmpty({ message: 'El título otorgado es obligatorio.' })
  @IsString({ message: 'El título otorgado debe ser un texto.' })
  awarded_degree: string;

  @IsNotEmpty({ message: 'La duración en semestres es obligatoria.' })
  @IsInt({ message: 'La duración debe ser un número entero.' })
  @Min(1, { message: 'La duración debe ser mayor o igual a 1.' })
  duration_semesters: number;

 @IsNotEmpty({ message: 'El total de créditos es obligatorio.' })
  @IsInt({ message: 'El total de créditos debe ser un número entero.' })
  @ValidateIf((o, v) => {
    const parent = (o as any).__parent;
    return !parent || parent.titration_type !== 'SINGLE_CYCLE';
  })
  @IsNotEmpty({ message: 'El total de créditos es obligatorio.' })
  @IsInt({ message: 'El total de créditos debe ser un número entero.' })
  @Min(0, { message: 'El total de créditos debe ser mayor o igual a 0.' })
  total_credits: number;

  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser verdadero o falso.' })
  status?: boolean;
}