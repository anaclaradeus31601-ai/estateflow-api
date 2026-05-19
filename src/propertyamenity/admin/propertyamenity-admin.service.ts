import { Injectable } from '@nestjs/common';
import { CreatePropertyamenityDto } from '../dto/create-propertyamenity.dto';
import { UpdatePropertyamenityDto } from '../dto/update-propertyamenity.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  EntityAlreadyExistsException,
  EntityNotFoundException,
} from 'src/common/exceptions';

@Injectable()
export class PropertyamenityAdminService {
  constructor(private prisma: PrismaService) {}

  async create(createPropertyamenityDto: CreatePropertyamenityDto) {
    const propertyAmenityExists = await this.prisma.propertyAmenity.findFirst({
      where: {
        propertyId: createPropertyamenityDto.propertyId,
        amenityId: createPropertyamenityDto.amenityId,
      },
    });

    if (propertyAmenityExists) {
      throw new EntityAlreadyExistsException(
        'Este imóvel já possui esta comodidade',
      );
    }

    return this.prisma.propertyAmenity.create({
      data: createPropertyamenityDto,
    });
  }

  async update(id: string, updatePropertyamenityDto: UpdatePropertyamenityDto) {
    const propertyAmenityExists = await this.prisma.propertyAmenity.findUnique({
      where: { id },
    });

    if (!propertyAmenityExists) {
      throw new EntityNotFoundException('Comodidade do imóvel', id);
    }

    return this.prisma.propertyAmenity.update({
      where: { id },
      data: updatePropertyamenityDto,
    });
  }

  async remove(id: string) {
    const propertyAmenityExists = await this.prisma.propertyAmenity.findUnique({
      where: { id },
    });

    if (!propertyAmenityExists) {
      throw new EntityNotFoundException('Comodidade do imóvel', id);
    }

    return this.prisma.propertyAmenity.delete({
      where: { id },
    });
  }
}
