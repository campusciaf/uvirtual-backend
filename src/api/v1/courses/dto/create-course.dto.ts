import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export enum CourseType {
  OBLIGATORY = 'OBLIGATORY',
  ELECTIVE = 'ELECTIVE'
}

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  program_level_id: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  credits: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  total_hours: number;

  @IsNotEmpty()
  @IsEnum(CourseType)
  type: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  order: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  semester: number;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
