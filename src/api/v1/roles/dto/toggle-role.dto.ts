import { IsBoolean } from 'class-validator';

export class ToggleRoleDto {
  @IsBoolean()
  isActive: boolean;
}
