import { Controller, Get, Param, ParseFloatPipe } from '@nestjs/common';
import { PropertyService } from './public-property.service';
import { PropertyStatus, PropertyType } from '@prisma/client';
import { title } from 'process';


@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) { }

  @Get()
  findAll(dto: {title?: string, page?: number, limit?: number}) {
    return this.propertyService.findAll(dto);
  }

  @Get('available')
  findAvailablePropertiesController() {
    return this.propertyService.findAvailableProperties();
  }

  @Get('type/:type')
  findPropertiesByType(@Param('type') type: PropertyType) {
    return this.propertyService.findPropertiesByType(type);
  }

  @Get('owner/:ownerId')
  findPropertiesByOwner(@Param('ownerId') ownerId: string) {
    return this.propertyService.findPropertiesByOwner(ownerId);
  }

  @Get('realtor/:realtorId')
  findPropertiesByRealtor(@Param('realtorId') realtorId: string) {
    return this.propertyService.findPropertiesByRealtor(realtorId);
  }

  @Get('featured')
  findFeaturedProperties() {
    return this.propertyService.findFeaturedProperties();
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @Get('price/:minPrice/:maxPrice')
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
  findPropertiesByStatus(@Param('status') status: PropertyStatus) {
    return this.propertyService.findPropertiesByStatus(status);
  }





}
