import { Controller, Get, Post, Body, Patch, Param, Delete, ParseFloatPipe, Query, } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyStatus, PropertyType } from '@prisma/client';


@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) { }

  @Post()
  create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertyService.create(createPropertyDto);
  }

  @Get()
  findAll() {
    return this.propertyService.findAll();
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


  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto) {
    return this.propertyService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertyService.remove(id);
  }




}
