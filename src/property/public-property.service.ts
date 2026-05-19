import {
  Injectable,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyStatus, PropertyType } from '@prisma/client';
import { InvalidPriceRangeException } from 'src/common/exceptions';

@Injectable()
export class PropertyService {
  constructor(private readonly prisma: PrismaService) { }

  async findOne(id: string) {
    return this.prisma.property.findUnique({
      where: {
        id,
      },
      include: {
        owner: true,
        realtor: true,
      },
    });
  }

  async findAll(dto: {title?: string, page?: number, limit?: number}) {
    const {title, page = 1, limit = 15} = dto;
    return this.prisma.property.findMany({
      ...(title && {
        where: {
          title: {
            contains: title,
            mode: 'insensitive',
          },
        },
      }), 
      skip: (page - 1) * limit,
      take: limit,
      include: {
        owner: true,
        realtor: true,
      },
    })  
  }

  async findAvailableProperties() {
    return this.prisma.property.findMany({
      where: {
        status: 'AVAILABLE',
      },
    });
  }

  async findPropertiesByStatus(status: PropertyStatus) {
    return this.prisma.property.findMany({
      where: {
        status,
      },
    });
  }

  async findPropertiesByType(type: PropertyType) {
    return this.prisma.property.findMany({
      where: {
        type,
      },
    });
  }

  async findPropertiesByOwner(ownerId: string) {
    return this.prisma.property.findMany({
      where: {
        ownerId,
      },
    });
  }

  async findPropertiesByRealtor(realtorId: string) {
    return this.prisma.property.findMany({
      where: {
        realtorId,
      },
    });
  }

  async findFeaturedProperties() {
    return this.prisma.property.findMany({
      where: {
        featured: true,
      },
    });
  }

  async findPropertiesByPriceRange(
    minPrice: number,
    maxPrice: number,
  ) {
    const min = Number(minPrice);
    const max = Number(maxPrice);

    if (isNaN(min) || isNaN(max)) {
      throw new InvalidPriceRangeException();
    }

    return this.prisma.property.findMany({
      where: {
        OR: [
          {
            rentPrice: {
              gte: min,
              lte: max,
            },
          },
          {
            salePrice: {
              gte: min,
              lte: max,
            },
          },
        ],
      },
    });
  }
}