import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export enum CourseType {
  OBLIGATORY = 'OBLIGATORY',
  ELECTIVE = 'ELECTIVE'
}

export class CreateCourseDto {
  @IsNotEmpty({ message: 'El nivel del programa es obligatorio.' })
  @IsString({ message: 'El nivel del programa debe ser un texto.' })
  program_level_id: string;

  @IsOptional()
  @IsString({ message: 'El catálogo debe ser un texto.' })
  catalog_id?: string;

  @IsNotEmpty({ message: 'El código es obligatorio.' })
  @IsString({ message: 'El código debe ser un texto.' })
  code: string;

  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @IsString({ message: 'El nombre debe ser un texto.' })
  name: string;

  @IsOptional()
  @IsString({ message: 'La imagen debe ser un texto.' })
  image_url?: string;

  @IsNotEmpty({ message: 'Los créditos son obligatorios.' })
  @IsInt({ message: 'Los créditos deben ser un número entero.' })
  @Min(1, { message: 'Los créditos deben ser mayor o igual a 1.' })
  credits: number;

  @IsNotEmpty({ message: 'Las horas totales son obligatorias.' })
  @IsInt({ message: 'Las horas totales deben ser un número entero.' })
  @Min(1, { message: 'Las horas totales deben ser mayor o igual a 1.' })
  total_hours: number;

  @IsNotEmpty({ message: 'El tipo es obligatorio.' })
  @IsEnum(CourseType, { message: 'El tipo no es válido.' })
  type: string;

  @IsNotEmpty({ message: 'El orden es obligatorio.' })
  @IsInt({ message: 'El orden debe ser un número entero.' })
  @Min(1, { message: 'El orden debe ser mayor o igual a 1.' })
  order: number;

  @IsNotEmpty({ message: 'El semestre es obligatorio.' })
  @IsInt({ message: 'El semestre debe ser un número entero.' })
  @Min(1, { message: 'El semestre debe ser mayor o igual a 1.' })
  semester: number;

  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser verdadero o falso.' })
  status?: boolean;
}