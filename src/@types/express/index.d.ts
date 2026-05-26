import type { AuthUser } from '../../auth/types/auth-user.type';

export {};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
