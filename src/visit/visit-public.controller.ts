import { Controller, Get, Param } from '@nestjs/common';
import { VisitPublicService } from './visit-public.service';

@Controller('visit')
export class VisitPublicController {
  constructor(private readonly visitService: VisitPublicService) {}

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
}
