import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreatePropertyamenityDto } from '../dto/create-propertyamenity.dto';
import { UpdatePropertyamenityDto } from '../dto/update-propertyamenity.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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
      throw new UnauthorizedException('This property already has this amenity');
    }

    return this.prisma.propertyAmenity.create({
      data: createPropertyamenityDto,
    });
  }

  update(id: string, updatePropertyamenityDto: UpdatePropertyamenityDto) {
    const propertyAmenityExists = this.prisma.propertyAmenity.findUnique({
      where: { id },
    });

    if (!propertyAmenityExists) {
      throw new UnauthorizedException('This property amenity does not exist');
    }
    return this.prisma.propertyAmenity.update({
      where: { id },
      data: updatePropertyamenityDto,
    });
  }

  remove(id: string) {
    const propertyAmenityExists = this.prisma.propertyAmenity.findUnique({
      where: { id },
    });

    if (!propertyAmenityExists) {
      throw new UnauthorizedException('This property amenity does not exist');
    }

    return this.prisma.propertyAmenity.delete({
      where: { id },
    });
  }
}
