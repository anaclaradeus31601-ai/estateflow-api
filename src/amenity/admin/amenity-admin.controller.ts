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
import { CreateAmenityDto } from '../dto/create-amenity.dto';
import { UpdateAmenityDto } from '../dto/update-amenity.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserRole } from '@prisma/client';
import { AmenityAdminService } from './amenity-admin.service';

@ApiTags('admin/amenity')
@ApiBearerAuth()
@Controller('admin/amenity')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AmenityAdminController {
  constructor(private readonly amenityService: AmenityAdminService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar comodidade' })
  @ApiResponse({ status: 201, description: 'Comodidade criada' })
  create(@Body() createAmenityDto: CreateAmenityDto) {
    return this.amenityService.create(createAmenityDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar comodidade' })
  @ApiParam({ name: 'id', description: 'ID da comodidade' })
  @ApiResponse({ status: 200, description: 'Comodidade atualizada' })
  update(@Param('id') id: string, @Body() updateAmenityDto: UpdateAmenityDto) {
    return this.amenityService.update(id, updateAmenityDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover comodidade' })
  @ApiParam({ name: 'id', description: 'ID da comodidade' })
  @ApiResponse({ status: 200, description: 'Comodidade removida' })
  remove(@Param('id') id: string) {
    return this.amenityService.remove(id);
  }
}
