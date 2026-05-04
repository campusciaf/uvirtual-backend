import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateProgramsLevelDto {
  @IsNotEmpty()
  @IsString()
  level: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  order: number;

  @IsNotEmpty()
  @IsString()
  awarded_degree: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  duration_semesters: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  total_credits: number;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
