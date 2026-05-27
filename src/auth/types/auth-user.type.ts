import { UserRole } from '@prisma/client';

export type AuthUser = {
  sub: string;
  sid: string;
  email: string;
  role: UserRole;
  name: string;
};
