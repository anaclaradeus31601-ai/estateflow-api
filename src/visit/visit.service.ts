import { Injectable } from '@nestjs/common';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VisitService {
  constructor(private prisma: PrismaService ) {}

  async create(createVisitDto: CreateVisitDto) {

    const visitExists = await this.prisma.visit.findFirst({
      where: {
        scheduledAt: createVisitDto.scheduledAt,
        realtorId: createVisitDto.realtorId,
        clientId: createVisitDto.clientId,
        propertyId: createVisitDto.propertyId,
      },
    });

    if (visitExists) {
      return 'Visit already exists';
    }

    return this.prisma.visit.create({
      data: {
        scheduledAt: createVisitDto.scheduledAt,
        realtorId: createVisitDto.realtorId,
        clientId: createVisitDto.clientId,
        propertyId: createVisitDto.propertyId,
      },
    });

  }

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

  update(id: string, updateVisitDto: UpdateVisitDto) {

    const visitExists = this.prisma.visit.findUnique({
      where: {
        id,
      },
    });

    if (!visitExists) {
      return 'Visit not found';
    }

    return this.prisma.visit.update({
      where: {
        id,
      },
      data: {
        scheduledAt: updateVisitDto.scheduledAt,
        realtorId: updateVisitDto.realtorId,
        clientId: updateVisitDto.clientId,
        propertyId: updateVisitDto.propertyId,
      },
    });
  }

  remove(id: string) {
    const visitExists = this.prisma.visit.findUnique({
      where: {
        id: id.toString(),
      },
    });

    if (!visitExists) {
      return 'Visit not found';
    }

    return this.prisma.visit.delete({
      where: {
        id: id.toString(),
      },
    });
  }

  async findTodayVisits(){
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

  async findVisitsByRealtor(realtorId: string){
    return this.prisma.visit.findMany({
      where: {
        status: "SCHEDULED",
        realtorId: realtorId,
      },
      include: {
        realtor: true
      }
    });
  }

  async findVisitsByClient(clientId: string){
    return this.prisma.visit.findMany({
      where: {
        status: "SCHEDULED",
        clientId: clientId,
      },
      include: {
        client: true
      }
    });
  }

  async findVisitsByProperty(propertyId: string){
    return this.prisma.visit.findMany({
      where: {
        status: "SCHEDULED",
        propertyId: propertyId,
      },
      include: {
        property: true
      }
    });
  }

  async findVisitsByDate(date: Date){
    return this.prisma.visit.findMany({
      where: {
        scheduledAt: date,
        status: "SCHEDULED",
      },
    });
  } 

}
