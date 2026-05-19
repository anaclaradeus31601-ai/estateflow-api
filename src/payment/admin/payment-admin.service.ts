import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  EntityAlreadyExistsException,
  EntityNotFoundException,
} from 'src/common/exceptions';

@Injectable()
export class PaymentAdminService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const paymentExists = await this.prisma.payment.findFirst({
      where: {
        contractId: createPaymentDto.contractId,
        dueDate: new Date(createPaymentDto.dueDate),
      },
    });

    if (paymentExists) {
      throw new EntityAlreadyExistsException(
        'Já existe pagamento para este contrato na data de vencimento informada',
      );
    }

    return this.prisma.payment.create({
      data: {
        contractId: createPaymentDto.contractId,
        userId: createPaymentDto.userId,
        amount: createPaymentDto.amount,
        dueDate: new Date(createPaymentDto.dueDate),
        paidDate: new Date(createPaymentDto.paidDate),
        status: createPaymentDto.status,
        stripePaymentIntentId: createPaymentDto.stripePaymentIntentId,
        stripeInvoiceId: createPaymentDto.stripeInvoiceId,
      },
    });
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    const paymentExists = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!paymentExists) {
      throw new EntityNotFoundException('Pagamento', id);
    }

    return this.prisma.payment.update({
      where: { id },
      data: {
        ...updatePaymentDto,
        dueDate: updatePaymentDto.dueDate
          ? new Date(updatePaymentDto.dueDate)
          : undefined,
        paidDate: updatePaymentDto.paidDate
          ? new Date(updatePaymentDto.paidDate)
          : undefined,
      },
    });
  }

  async remove(id: string) {
    const paymentExists = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!paymentExists) {
      throw new EntityNotFoundException('Pagamento', id);
    }

    return this.prisma.payment.delete({
      where: { id },
    });
  }
}
