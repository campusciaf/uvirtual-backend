import { SetMetadata } from '@nestjs/common';

export const MODULE_ACCESS_KEY = 'moduleAccess';

export const ModuleAccess = (moduleCode: string) =>
  SetMetadata(MODULE_ACCESS_KEY, moduleCode);
