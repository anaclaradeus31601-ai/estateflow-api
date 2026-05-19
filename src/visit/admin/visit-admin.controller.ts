import { Controller, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CreateVisitDto } from '../dto/create-visit.dto';
import { UpdateVisitDto } from '../dto/update-visit.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserRole } from '@prisma/client';
import { VisitAdminService } from './visit-admin.service';

@Controller('admin/visit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VisitAdminController {
  constructor(private readonly visitService: VisitAdminService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createVisitDto: CreateVisitDto) {
    return this.visitService.create(createVisitDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateVisitDto: UpdateVisitDto) {
    return this.visitService.update(id, updateVisitDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.visitService.remove(id);
  }
}
