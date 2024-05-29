import { SetMetadata } from '@nestjs/common';
import { Roles } from '../const/roles.const';

export const ROLES_KEY = 'user_roles';

export const RBAC = (role: Roles) => SetMetadata(ROLES_KEY, role);
