import { IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class UserFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim() || undefined)
  search?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim() || undefined)
  roleName?: string;
}
