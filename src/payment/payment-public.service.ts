import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentPublicService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.payment.findMany();
  }

  findOne(id: string) {
    return this.prisma.payment.findUnique({
      where: {
        id: id,
      },
    });
  }
}
