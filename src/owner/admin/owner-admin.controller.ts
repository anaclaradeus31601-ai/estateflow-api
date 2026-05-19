import { Controller, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CreateOwnerDto } from '../dto/create-owner.dto';
import { UpdateOwnerDto } from '../dto/update-owner.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserRole } from '@prisma/client';
import { OwnerAdminService } from './owner-admin.service';

@Controller('admin/owner')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OwnerAdminController {
  constructor(private readonly ownerService: OwnerAdminService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createOwnerDto: CreateOwnerDto) {
    return this.ownerService.create(createOwnerDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateOwnerDto: UpdateOwnerDto) {
    return this.ownerService.update(id, updateOwnerDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.ownerService.remove(id);
  }
}
