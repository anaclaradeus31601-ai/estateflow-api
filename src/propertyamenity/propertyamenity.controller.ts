import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PropertyamenityService } from './propertyamenity.service';
import { CreatePropertyamenityDto } from './dto/create-propertyamenity.dto';
import { UpdatePropertyamenityDto } from './dto/update-propertyamenity.dto';

@Controller('propertyamenity')
export class PropertyamenityController {
  constructor(private readonly propertyamenityService: PropertyamenityService) {}

  @Post()
  create(@Body() createPropertyamenityDto: CreatePropertyamenityDto) {
    return this.propertyamenityService.create(createPropertyamenityDto);
  }

  @Get()
  findAll() {
    return this.propertyamenityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertyamenityService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePropertyamenityDto: UpdatePropertyamenityDto) {
    return this.propertyamenityService.update(id, updatePropertyamenityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertyamenityService.remove(id);
  }
}
