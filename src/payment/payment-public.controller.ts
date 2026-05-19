import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentPublicService } from './payment-public.service';

@ApiTags('payment')
@Controller('payment')
export class PaymentPublicController {
  constructor(private readonly paymentService: PaymentPublicService) {}

  @Get()
  @ApiOperation({ summary: 'Listar pagamentos' })
  @ApiResponse({ status: 200, description: 'Lista de pagamentos' })
  findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pagamento por ID' })
  @ApiParam({ name: 'id', description: 'ID do pagamento' })
  @ApiResponse({ status: 200, description: 'Pagamento encontrado' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }
}
