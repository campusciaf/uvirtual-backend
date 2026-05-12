import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProgramLevelTypeDto {
  @IsOptional()
  @IsString({ message: 'El código debe ser un texto.' })
  code?: string;

  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @IsString({ message: 'El nombre debe ser un texto.' })
  name: string;

  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser verdadero o falso.' })
  status?: boolean;
}