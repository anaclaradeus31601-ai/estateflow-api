import { User } from "@prisma/client";
import type * as express from 'express';

declare global {
  namespace Express {
    export interface Request {
      user?: User,
    }
  }
}