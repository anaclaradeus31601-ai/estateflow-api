import { Controller, Get, Param } from '@nestjs/common';
import { ContractPublicService } from './contract-public.service';

@Controller('contract')
export class ContractPublicController {
  constructor(private readonly contractService: ContractPublicService) {}

  @Get()
  findAll() {
    return this.contractService.findAll();
  }

  @Get('client/:clientId')
  findContractsByClient(@Param('clientId') clientId: string) {
    return this.contractService.findContractsByClient(clientId);
  }

  @Get('property/:propertyId')
  findContractsByProperty(@Param('propertyId') propertyId: string) {
    return this.contractService.findContractsByProperty(propertyId);
  }

  @Get('expiring')
  findExpiringContracts() {
    return this.contractService.findExpiringContracts();
  }

  @Get('overdue')
  findOverdueContracts() {
    return this.contractService.findOverdueContracts();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractService.findOne(id);
  }
}
