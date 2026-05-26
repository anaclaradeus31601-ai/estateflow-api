import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VisitPublicService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.visit.findMany();
  }

  findOne(id: string) {
    return this.prisma.visit.findUnique({
      where: {
        id,
      },
    });
  }

  async findTodayVisits() {
    const today = new Date();

    return this.prisma.contract.findMany({
      where: {
        startDate: {
          lte: today,
        },
        endDate: {
          gte: today,
        },
        status: 'ACTIVE',
      },
    });
  }

  async findVisitsByRealtor(realtorId: string) {
    return this.prisma.visit.findMany({
      where: {
        status: 'SCHEDULED',
        realtorId: realtorId,
      },
      include: {
        realtor: true,
      },
    });
  }

  async findVisitsByClient(clientId: string) {
    return this.prisma.visit.findMany({
      where: {
        status: 'SCHEDULED',
        clientId: clientId,
      },
      include: {
        client: true,
      },
    });
  }

  async findVisitsByProperty(propertyId: string) {
    return this.prisma.visit.findMany({
      where: {
        status: 'SCHEDULED',
        propertyId: propertyId,
      },
      include: {
        property: true,
      },
    });
  }

  async findVisitsByDate(date: Date) {
    return this.prisma.visit.findMany({
      where: {
        scheduledAt: date,
        status: 'SCHEDULED',
      },
    });
  }
}
