import { Injectable } from '@nestjs/common';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AmenityService {
  constructor(private prisma: PrismaService) {}

  async create(createAmenityDto: CreateAmenityDto) {

    const amenityExists = await this.prisma.amenity.findFirst({
      where: { name: createAmenityDto.name },
    });

    if (amenityExists) {
      throw new Error('Amenity already exists');
    }

    return this.prisma.amenity.create({ data: createAmenityDto });
  }

  findAll() {
    return this.prisma.amenity.findMany();
  }

  findOne(id: string) {
    return this.prisma.amenity.findUnique({ where: { id } });
  }

  update(id: string, updateAmenityDto: UpdateAmenityDto) {
    const amenityExists = this.prisma.amenity.findUnique({
      where: { id },
    });

    if (!amenityExists) {
      throw new Error('Amenity not found');
    }
    return this.prisma.amenity.update({ where: { id }, data: updateAmenityDto });
  }

  remove(id: string) {
    const amenityExists = this.prisma.amenity.findUnique({
      where: { id },
    });

    if (!amenityExists) {
      throw new Error('Amenity not found');
    }
    return this.prisma.amenity.delete({ where: { id } });
  }
}
