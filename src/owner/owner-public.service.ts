import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OwnerPublicService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.owner.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpfCnpj: true,      
      },
    });
  }

  findOne(id: string) {
    return this.prisma.owner.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpfCnpj: true,      
      },
    });
  }
}
