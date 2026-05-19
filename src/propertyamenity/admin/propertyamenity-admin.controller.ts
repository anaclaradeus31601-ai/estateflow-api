import { Controller, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CreatePropertyamenityDto } from '../dto/create-propertyamenity.dto';
import { UpdatePropertyamenityDto } from '../dto/update-propertyamenity.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserRole } from '@prisma/client';
import { PropertyamenityAdminService } from './propertyamenity-admin.service';

@Controller('admin/propertyamenity')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertyamenityAdminController {
  constructor(private readonly propertyamenityService: PropertyamenityAdminService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createPropertyamenityDto: CreatePropertyamenityDto) {
    return this.propertyamenityService.create(createPropertyamenityDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updatePropertyamenityDto: UpdatePropertyamenityDto) {
    return this.propertyamenityService.update(id, updatePropertyamenityDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.propertyamenityService.remove(id);
  }
}
