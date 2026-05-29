import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'EstateFlow API';
  }

  async getHealth() {
    const startedAt = Date.now();

    await this.prisma.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
      service: 'estateflow-api',
      database: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      responseTimeMs: Date.now() - startedAt,
    };
  }
}
