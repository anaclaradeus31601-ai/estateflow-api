import { User } from "@prisma/client";
import type * as express from 'express';

declare global {
  namespace Express {
    export interface Request {
      user?: User,
    }
    interface Request {
      user?: {
        sub: string;
        email: string;
        role: UserRole;
        name: string;
      };
    }

  }
}