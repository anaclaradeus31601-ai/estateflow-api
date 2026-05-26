import { Controller, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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
import { UserRole } from '@prisma/client';
import { VisitAdminService } from './visit-admin.service';
import { Auth } from 'src/auth/guard/auth.guard';

@ApiTags('admin/visit')
@ApiBearerAuth()
@Controller('admin/visit')
@Auth(UserRole.ADMIN)
export class VisitAdminController {
  constructor(private readonly visitService: VisitAdminService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.REALTOR)
  @ApiOperation({ summary: 'Criar visita' })
  @ApiResponse({ status: 201, description: 'Visita criada' })
  create(@Body() createVisitDto: CreateVisitDto) {
    return this.visitService.create(createVisitDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.REALTOR)
  @ApiOperation({ summary: 'Atualizar visita' })
  @ApiParam({ name: 'id', description: 'ID da visita' })
  @ApiResponse({ status: 200, description: 'Visita atualizada' })
  update(@Param('id') id: string, @Body() updateVisitDto: UpdateVisitDto) {
    return this.visitService.update(id, updateVisitDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.REALTOR)
  @ApiOperation({ summary: 'Remover visita' })
  @ApiParam({ name: 'id', description: 'ID da visita' })
  @ApiResponse({ status: 200, description: 'Visita removida' })
  remove(@Param('id') id: string) {
    return this.visitService.remove(id);
  }
}
