import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  tenant_code: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  password: string;
}
