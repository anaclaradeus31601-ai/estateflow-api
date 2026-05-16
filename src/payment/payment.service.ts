import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentService {

  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto) {

    const paymentExists =  await this.prisma.payment.findFirst({
      where: {
        contractId: createPaymentDto.contractId,
        dueDate: new Date(createPaymentDto.dueDate),
      }
    })

    if(paymentExists) {
      throw new Error('Payment already exists for this contract and due date')
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
      }
    })

  }

  findAll() {
    return this.prisma.payment.findMany();
  }

  findOne(id: string) {
    return this.prisma.payment.findUnique({
      where: {
        id: id,
      }
    });
  }

  update(id: string, updatePaymentDto: UpdatePaymentDto) {

    const paymentExists =  this.prisma.payment.findUnique({
      where: {
        id: id,
      }
    })

    if(!paymentExists) {
      throw new Error('Payment not found')
    }

    return this.prisma.payment.update({
      where: {
        id: id,
      },
      data: {
        ...updatePaymentDto,
        dueDate: updatePaymentDto.dueDate ? new Date(updatePaymentDto.dueDate) : undefined,
        paidDate: updatePaymentDto.paidDate ? new Date(updatePaymentDto.paidDate) : undefined
      }
    });
  }

  remove(id: string) {

    const paymentExists =  this.prisma.payment.findUnique({
      where: {
        id: id,
      }
    })

    if(!paymentExists) {
      throw new Error('Payment not found')
    } 
    
    return this.prisma.payment.delete({
      where: {
        id: id,
      }
    });
  }
}
