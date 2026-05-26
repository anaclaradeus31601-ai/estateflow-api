import { Injectable, Logger } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAuditLogsDto } from './dto/find-audit-logs.dto';

export interface CreateAuditLogInput {
  actorId?: string;
  actorName: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  resource: string;
  resourceId?: string;
  method: string;
  path: string;
  requestBody?: Prisma.InputJsonValue;
  requestParams?: Prisma.InputJsonValue;
  requestQuery?: Prisma.InputJsonValue;
  responseStatus: number;
  ip?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateAuditLogInput) {
    try {
      return await this.prisma.auditLog.create({
        data: input,
      });
    } catch (error) {
      this.logger.error('Failed to persist audit log', error);
      return null;
    }
  }

  findAll(filters: FindAuditLogsDto) {
    const where: Prisma.AuditLogWhereInput = {
      ...(filters.actorId ? { actorId: filters.actorId } : {}),
      ...(filters.actorRole ? { actorRole: filters.actorRole } : {}),
      ...(filters.resource ? { resource: filters.resource } : {}),
      ...(filters.action ? { action: filters.action } : {}),
      ...(filters.method ? { method: filters.method.toUpperCase() } : {}),
      ...(filters.search
        ? {
            OR: [
              { actorName: { contains: filters.search, mode: 'insensitive' } },
              { actorEmail: { contains: filters.search, mode: 'insensitive' } },
              { path: { contains: filters.search, mode: 'insensitive' } },
              { resource: { contains: filters.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(filters.from || filters.to
        ? {
            createdAt: {
              ...(filters.from ? { gte: new Date(filters.from) } : {}),
              ...(filters.to ? { lte: new Date(filters.to) } : {}),
            },
          }
        : {}),
    };

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit ?? 50,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}
