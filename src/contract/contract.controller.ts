import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Post()
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractService.create(createContractDto);
  }

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContractDto: UpdateContractDto) {
    return this.contractService.update(id, updateContractDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contractService.remove(id);
  }
}
