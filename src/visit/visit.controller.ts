import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VisitService } from './visit.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';

@Controller('visit')
export class VisitController {
  constructor(private readonly visitService: VisitService) {}

  @Post()
  create(@Body() createVisitDto: CreateVisitDto) {
    return this.visitService.create(createVisitDto);
  }

  @Get()
  findAll() {
    return this.visitService.findAll();
  }

  @Get('today')
  findTodayVisits(){
    return this.visitService.findTodayVisits();
  }

  @Get('realtor/:realtorId')
  findVisitsByRealtor(@Param('realtorId') realtorId: string) {
    return this.visitService.findVisitsByRealtor(realtorId);
  }

  @Get('client/:clientId')
  findVisitsByClient(@Param('clientId') clientId: string) {
    return this.visitService.findVisitsByClient(clientId);
  }

  @Get('property/:propertyId')
  findVisitsByProperty(@Param('propertyId') propertyId: string) {
    return this.visitService.findVisitsByProperty(propertyId);
  }

  @Get('date/:date')
  findVisitsByDate(@Param('date') date: string) {
    return this.visitService.findVisitsByDate(new Date(date));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.visitService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVisitDto: UpdateVisitDto) {
    return this.visitService.update(id, updateVisitDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.visitService.remove(id);
  }
}
