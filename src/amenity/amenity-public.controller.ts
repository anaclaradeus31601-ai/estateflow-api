import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AmenityPublicService } from './amenity-public.service';

@ApiTags('amenity')
@Controller('amenity')
export class AmenityPublicController {
  constructor(private readonly amenityService: AmenityPublicService) {}

  @Get()
  @ApiOperation({ summary: 'Listar comodidades' })
  @ApiResponse({ status: 200, description: 'Lista de comodidades' })
  findAll() {
    return this.amenityService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar comodidade por ID' })
  @ApiParam({ name: 'id', description: 'ID da comodidade' })
  @ApiResponse({ status: 200, description: 'Comodidade encontrada' })
  @ApiResponse({ status: 404, description: 'Comodidade não encontrada' })
  findOne(@Param('id') id: string) {
    return this.amenityService.findOne(id);
  }
}
