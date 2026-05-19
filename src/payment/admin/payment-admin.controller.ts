import { Controller, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PaymentAdminService } from './payment-admin.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@Controller('admin/payment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentAdminController {
  constructor(private readonly paymentService: PaymentAdminService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.paymentService.remove(id);
  }
}
