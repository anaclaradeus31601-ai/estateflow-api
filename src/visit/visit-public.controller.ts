import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VisitPublicService } from './visit-public.service';

@ApiTags('visit')
@Controller('visit')
export class VisitPublicController {
  constructor(private readonly visitService: VisitPublicService) {}

  @Get()
  @ApiOperation({ summary: 'Listar visitas' })
  @ApiResponse({ status: 200, description: 'Lista de visitas' })
  findAll() {
    return this.visitService.findAll();
  }

  @Get('today')
  @ApiOperation({ summary: 'Listar visitas de hoje' })
  @ApiResponse({ status: 200, description: 'Visitas do dia' })
  findTodayVisits() {
    return this.visitService.findTodayVisits();
  }

  @Get('realtor/:realtorId')
  @ApiOperation({ summary: 'Listar visitas por corretor' })
  @ApiParam({ name: 'realtorId', description: 'ID do corretor' })
  @ApiResponse({ status: 200, description: 'Visitas do corretor' })
  findVisitsByRealtor(@Param('realtorId') realtorId: string) {
    return this.visitService.findVisitsByRealtor(realtorId);
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Listar visitas por cliente' })
  @ApiParam({ name: 'clientId', description: 'ID do cliente' })
  @ApiResponse({ status: 200, description: 'Visitas do cliente' })
  findVisitsByClient(@Param('clientId') clientId: string) {
    return this.visitService.findVisitsByClient(clientId);
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Listar visitas por imóvel' })
  @ApiParam({ name: 'propertyId', description: 'ID do imóvel' })
  @ApiResponse({ status: 200, description: 'Visitas do imóvel' })
  findVisitsByProperty(@Param('propertyId') propertyId: string) {
    return this.visitService.findVisitsByProperty(propertyId);
  }

  @Get('date/:date')
  @ApiOperation({ summary: 'Listar visitas por data' })
  @ApiParam({
    name: 'date',
    example: '2026-05-20',
    description: 'Data (YYYY-MM-DD)',
  })
  @ApiResponse({ status: 200, description: 'Visitas na data' })
  findVisitsByDate(@Param('date') date: string) {
    return this.visitService.findVisitsByDate(new Date(date));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar visita por ID' })
  @ApiParam({ name: 'id', description: 'ID da visita' })
  @ApiResponse({ status: 200, description: 'Visita encontrada' })
  @ApiResponse({ status: 404, description: 'Visita não encontrada' })
  findOne(@Param('id') id: string) {
    return this.visitService.findOne(id);
  }
}
