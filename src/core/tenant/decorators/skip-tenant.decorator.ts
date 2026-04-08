import { SetMetadata } from '@nestjs/common';

export const SKIP_TENANT = 'SKIP_TENANT';
export const SkipTenant = () => SetMetadata(SKIP_TENANT, true);
