import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Auth } from 'src/auth/guard/auth.guard';
import { AuditService } from './audit.service';
import { FindAuditLogsDto } from './dto/find-audit-logs.dto';

@ApiTags('admin/audit')
@ApiBearerAuth()
@Controller('admin/audit')
@Auth(UserRole.ADMIN)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Listar logs de auditoria' })
  @ApiResponse({ status: 200, description: 'Logs retornados com sucesso' })
  findAll(@Query() filters: FindAuditLogsDto) {
    return this.auditService.findAll(filters);
  }
}
