import { Injectable } from '@nestjs/common';
import { CreateVisitDto } from '../dto/create-visit.dto';
import { UpdateVisitDto } from '../dto/update-visit.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VisitAdminService {
  constructor(private prisma: PrismaService) {}

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
      throw new Error('Visit already exists');
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

  update(id: string, updateVisitDto: UpdateVisitDto) {
    const visitExists = this.prisma.visit.findUnique({
      where: {
        id,
      },
    });

    if (!visitExists) {
      throw new Error('Visit not found');
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
      throw new Error('Visit not found');
    }

    return this.prisma.visit.delete({
      where: {
        id: id.toString(),
      },
    });
  }
}
