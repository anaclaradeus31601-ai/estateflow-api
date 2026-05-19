import { Controller, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CreateAmenityDto } from '../dto/create-amenity.dto';
import { UpdateAmenityDto } from '../dto/update-amenity.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserRole } from '@prisma/client';
import { AmenityAdminService } from './amenity-admin.service';

@Controller('admin/amenity')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AmenityAdminController {
  constructor(private readonly amenityService: AmenityAdminService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createAmenityDto: CreateAmenityDto) {
    return this.amenityService.create(createAmenityDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateAmenityDto: UpdateAmenityDto) {
    return this.amenityService.update(id, updateAmenityDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.amenityService.remove(id);
  }
}
