import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ContractPublicService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.contract.findMany();
  }

  findOne(id: string) {
    return this.prisma.contract.findUnique({
      where: {
        id,
      },
    });
  }

  async findExpiringContracts() {
    const today = new Date();

    const next30Days = new Date();

    next30Days.setDate(today.getDate() + 30);

    return this.prisma.contract.findMany({
      where: {
        endDate: {
          gte: today,
          lte: next30Days,
        },
        status: 'ACTIVE',
      },
    });
  }

  async findOverdueContracts() {
    const today = new Date();

    return this.prisma.contract.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          not: null,
          lte: today,
        },
      },
      orderBy: {
        endDate: 'asc',
      },
      include: {
        client: true,
        property: true,
      },
    });
  }

  async findContractsByClient(clientId: string) {
    return this.prisma.contract.findMany({
      where: {
        clientId,
      },
      include: {
        property: true,
      },
    });
  }

  async findContractsByProperty(propertyId: string) {
    return this.prisma.contract.findMany({
      where: {
        propertyId,
      },
      include: {
        client: true,
      },
    });
  }
}
