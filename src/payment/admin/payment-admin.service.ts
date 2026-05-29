import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';
import {
  EntityAlreadyExistsException,
  EntityNotFoundException,
} from 'src/common/exceptions';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class PaymentAdminService {
  constructor(
    private prisma: PrismaService,
    private notification: NotificationService,
  ) {}

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

    const createdPayment = await this.prisma.payment.create({
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

    const paymentNotification = {
      type: 'PAYMENT_CREATED',
      title: 'Novo pagamento registrado',
      message: `Um pagamento de R$ ${createdPayment.amount} foi registrado com status ${createdPayment.status}.`,
      data: {
        paymentId: createdPayment.id,
        contractId: createdPayment.contractId,
        status: createdPayment.status,
      },
    };

    await this.notification.notifyUsers(
      [createdPayment.userId],
      paymentNotification,
    );
    await this.notification.notifyAdmins(paymentNotification);

    return createdPayment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    const paymentExists = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!paymentExists) {
      throw new EntityNotFoundException('Pagamento', id);
    }

    const updatedPayment = await this.prisma.payment.update({
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

    if (
      updatePaymentDto.status !== undefined &&
      updatePaymentDto.status !== paymentExists.status
    ) {
      const paymentStatusMessage: Record<PaymentStatus, string> = {
        PENDING: 'ficou pendente',
        COMPLETED: 'foi concluído',
        FAILED: 'falhou',
        REFUNDED: 'foi reembolsado',
      };

      const paymentNotification = {
        type: 'PAYMENT_STATUS_CHANGED',
        title: 'Status do pagamento atualizado',
        message: `O pagamento de R$ ${updatedPayment.amount} ${paymentStatusMessage[updatedPayment.status]}.`,
        data: {
          paymentId: updatedPayment.id,
          contractId: updatedPayment.contractId,
          oldStatus: paymentExists.status,
          newStatus: updatedPayment.status,
        },
      };

      await this.notification.notifyUsers(
        [updatedPayment.userId],
        paymentNotification,
      );
      await this.notification.notifyAdmins(paymentNotification);
    }

    return updatedPayment;
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
