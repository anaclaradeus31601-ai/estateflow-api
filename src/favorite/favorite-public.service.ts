import { Injectable } from '@nestjs/common';
import { EntityNotFoundException } from 'src/common/exceptions';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FavoritePublicService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            owner: true,
            realtor: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return favorites.map((favorite) => ({
      ...favorite,
      property: {
        ...favorite.property,
        isFavorite: true,
      },
    }));
  }

  async add(userId: string, propertyId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });

    if (!property) {
      throw new EntityNotFoundException('Imóvel', propertyId);
    }

    return this.prisma.favorite.upsert({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
      create: {
        userId,
        propertyId,
      },
      update: {},
      include: {
        property: {
          include: {
            owner: true,
            realtor: true,
          },
        },
      },
    });
  }

  async remove(userId: string, propertyId: string) {
    await this.prisma.favorite.deleteMany({
      where: {
        userId,
        propertyId,
      },
    });

    return {
      success: true,
    };
  }
}
