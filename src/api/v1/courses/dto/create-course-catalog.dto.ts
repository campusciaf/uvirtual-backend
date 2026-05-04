import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export enum CourseType {
  OBLIGATORY = 'OBLIGATORY',
  ELECTIVE = 'ELECTIVE'
}

export class CreateCourseCatalogDto {
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

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}