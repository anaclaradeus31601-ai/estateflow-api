import { Injectable } from '@nestjs/common';
import { CreateAmenityDto } from '../dto/create-amenity.dto';
import { UpdateAmenityDto } from '../dto/update-amenity.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  EntityAlreadyExistsException,
  EntityNotFoundException,
} from 'src/common/exceptions';

@Injectable()
export class AmenityAdminService {
  constructor(private prisma: PrismaService) {}

  async create(createAmenityDto: CreateAmenityDto) {
    const amenityExists = await this.prisma.amenity.findFirst({
      where: { name: createAmenityDto.name },
    });

    if (amenityExists) {
      throw new EntityAlreadyExistsException('Comodidade já cadastrada');
    }

    return this.prisma.amenity.create({ data: createAmenityDto });
  }

  async update(id: string, updateAmenityDto: UpdateAmenityDto) {
    const amenityExists = await this.prisma.amenity.findUnique({
      where: { id },
    });

    if (!amenityExists) {
      throw new EntityNotFoundException('Comodidade', id);
    }

    return this.prisma.amenity.update({
      where: { id },
      data: updateAmenityDto,
    });
  }

  async remove(id: string) {
    const amenityExists = await this.prisma.amenity.findUnique({
      where: { id },
    });

    if (!amenityExists) {
      throw new EntityNotFoundException('Comodidade', id);
    }

    return this.prisma.amenity.delete({ where: { id } });
  }
}
