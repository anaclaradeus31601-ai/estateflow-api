import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateVisitDto } from '../dto/create-visit.dto';
import { UpdateVisitDto } from '../dto/update-visit.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserRole } from '@prisma/client';
import { VisitAdminService } from './visit-admin.service';

@ApiTags('admin/visit')
@ApiBearerAuth()
@Controller('admin/visit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VisitAdminController {
  constructor(private readonly visitService: VisitAdminService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar visita' })
  @ApiResponse({ status: 201, description: 'Visita criada' })
  create(@Body() createVisitDto: CreateVisitDto) {
    return this.visitService.create(createVisitDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar visita' })
  @ApiParam({ name: 'id', description: 'ID da visita' })
  @ApiResponse({ status: 200, description: 'Visita atualizada' })
  update(@Param('id') id: string, @Body() updateVisitDto: UpdateVisitDto) {
    return this.visitService.update(id, updateVisitDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover visita' })
  @ApiParam({ name: 'id', description: 'ID da visita' })
  @ApiResponse({ status: 200, description: 'Visita removida' })
  remove(@Param('id') id: string) {
    return this.visitService.remove(id);
  }
}
