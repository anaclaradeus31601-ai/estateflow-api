// src/common/guards/auth.guard.ts
import { applyDecorators, UseGuards } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

export function Auth(...roles: UserRole[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(...roles),
  );
}