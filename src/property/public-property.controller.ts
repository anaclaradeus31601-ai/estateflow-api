import { Controller, Get, Param, ParseFloatPipe, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PropertyService } from './public-property.service';
import { PropertyStatus, PropertyType } from '@prisma/client';
import { FindPropertiesQueryDto } from './dto/find-properties-query.dto';

@ApiTags('property')
@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get()
  @ApiOperation({ summary: 'Listar imóveis com filtros opcionais' })
  @ApiResponse({ status: 200, description: 'Lista de imóveis' })
  findAll(@Query() dto: FindPropertiesQueryDto) {
    return this.propertyService.findAll(dto);
  }

  @Get('available')
  @ApiOperation({ summary: 'Listar imóveis disponíveis' })
  @ApiResponse({ status: 200, description: 'Imóveis disponíveis' })
  findAvailablePropertiesController() {
    return this.propertyService.findAvailableProperties();
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Listar imóveis por tipo' })
  @ApiParam({ name: 'type', enum: PropertyType })
  @ApiResponse({ status: 200, description: 'Imóveis filtrados por tipo' })
  findPropertiesByType(@Param('type') type: PropertyType) {
    return this.propertyService.findPropertiesByType(type);
  }

  @Get('owner/:ownerId')
  @ApiOperation({ summary: 'Listar imóveis por proprietário' })
  @ApiParam({ name: 'ownerId', description: 'ID do proprietário' })
  @ApiResponse({ status: 200, description: 'Imóveis do proprietário' })
  findPropertiesByOwner(@Param('ownerId') ownerId: string) {
    return this.propertyService.findPropertiesByOwner(ownerId);
  }

  @Get('realtor/:realtorId')
  @ApiOperation({ summary: 'Listar imóveis por corretor' })
  @ApiParam({ name: 'realtorId', description: 'ID do corretor' })
  @ApiResponse({ status: 200, description: 'Imóveis do corretor' })
  findPropertiesByRealtor(@Param('realtorId') realtorId: string) {
    return this.propertyService.findPropertiesByRealtor(realtorId);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Listar imóveis em destaque' })
  @ApiResponse({ status: 200, description: 'Imóveis em destaque' })
  findFeaturedProperties() {
    return this.propertyService.findFeaturedProperties();
  }

  @Get('price/:minPrice/:maxPrice')
  @ApiOperation({ summary: 'Listar imóveis por faixa de preço' })
  @ApiParam({ name: 'minPrice', type: Number, example: 1000 })
  @ApiParam({ name: 'maxPrice', type: Number, example: 5000 })
  @ApiResponse({ status: 200, description: 'Imóveis na faixa de preço' })
  findPropertiesByPriceRange(
    @Param('minPrice', ParseFloatPipe) minPrice: number,
    @Param('maxPrice', ParseFloatPipe) maxPrice: number,
  ) {
    return this.propertyService.findPropertiesByPriceRange(
      minPrice,
      maxPrice,
    );
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Listar imóveis por status' })
  @ApiParam({ name: 'status', enum: PropertyStatus })
  @ApiResponse({ status: 200, description: 'Imóveis filtrados por status' })
  findPropertiesByStatus(@Param('status') status: PropertyStatus) {
    return this.propertyService.findPropertiesByStatus(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar imóvel por ID' })
  @ApiParam({ name: 'id', description: 'ID do imóvel' })
  @ApiResponse({ status: 200, description: 'Imóvel encontrado' })
  @ApiResponse({ status: 404, description: 'Imóvel não encontrado' })
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }
}
