import { Controller, Get, Param } from '@nestjs/common';
import { PaymentPublicService } from './payment-public.service';

@Controller('payment')
export class PaymentPublicController {
  constructor(private readonly paymentService: PaymentPublicService) {}

  @Get()
  findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }
}
