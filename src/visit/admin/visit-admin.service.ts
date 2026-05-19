import { Injectable } from '@nestjs/common';
import { CreateVisitDto } from '../dto/create-visit.dto';
import { UpdateVisitDto } from '../dto/update-visit.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  EntityAlreadyExistsException,
  EntityNotFoundException,
} from 'src/common/exceptions';

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
      throw new EntityAlreadyExistsException('Visita já agendada');
    }

    return this.prisma.visit.create({
      data: createVisitDto,
    });
  }

  async update(id: string, updateVisitDto: UpdateVisitDto) {
    const visitExists = await this.prisma.visit.findUnique({
      where: { id },
    });

    if (!visitExists) {
      throw new EntityNotFoundException('Visita', id);
    }

    return this.prisma.visit.update({
      where: { id },
      data: updateVisitDto,
    });
  }

  async remove(id: string) {
    const visitExists = await this.prisma.visit.findUnique({
      where: { id },
    });

    if (!visitExists) {
      throw new EntityNotFoundException('Visita', id);
    }

    return this.prisma.visit.delete({
      where: { id },
    });
  }
}
