import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';

import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyStatus, PropertyType } from '@prisma/client';
import { InvalidPriceRangeException } from 'src/common/exceptions';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class AdminPropertyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
  ) {}

  async create(createPropertyDto: CreatePropertyDto) {
    // Verifica se já existe imóvel no mesmo endereço
    const propertyExists = await this.prisma.property.findFirst({
      where: {
        street: createPropertyDto.street,
        number: createPropertyDto.number,
        city: createPropertyDto.city,
        state: createPropertyDto.state,
        zipCode: createPropertyDto.zipCode,
      },
    });

    if (propertyExists) {
      throw new BadRequestException(
        'Property with this address already exists',
      );
    }

    // Verifica owner
    const owner = await this.prisma.owner.findUnique({
      where: {
        id: createPropertyDto.ownerId,
      },
    });

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    // Verifica realtor
    // Verifica realtor
    const realtor = await this.prisma.user.findFirst({
      where: {
        id: createPropertyDto.realtorId,
        role: 'REALTOR',
      },
    });

    if (!realtor) {
      throw new NotFoundException('Realtor not found');
    }

    // Criação do imóvel
    const createdProperty = await this.prisma.property.create({
      data: {
        title: createPropertyDto.title,
        description: createPropertyDto.description,

        type: createPropertyDto.type,
        transactionType: createPropertyDto.transactionType,
        status: createPropertyDto.status,

        street: createPropertyDto.street,
        number: createPropertyDto.number,
        complement: createPropertyDto.complement,
        neighborhood: createPropertyDto.neighborhood,
        city: createPropertyDto.city,
        state: createPropertyDto.state,
        zipCode: createPropertyDto.zipCode,
        country: createPropertyDto.country,

        area: createPropertyDto.area,
        bedrooms: createPropertyDto.bedrooms,
        bathrooms: createPropertyDto.bathrooms,
        garages: createPropertyDto.garages,

        rentPrice: createPropertyDto.rentPrice,
        salePrice: createPropertyDto.salePrice,
        condominiumFee: createPropertyDto.condominiumFee,
        iptu: createPropertyDto.iptu,

        images: createPropertyDto.images ?? [],
        videos: createPropertyDto.videos ?? [],

        virtualTourUrl: createPropertyDto.virtualTourUrl,

        latitude: createPropertyDto.latitude,
        longitude: createPropertyDto.longitude,

        featured: createPropertyDto.featured ?? false,
        views: createPropertyDto.views ?? 0,

        ownerId: createPropertyDto.ownerId,
        realtorId: createPropertyDto.realtorId,
      },
    });

    const propertyNotification = {
      type: 'PROPERTY_CREATED',
      title: 'Novo imóvel cadastrado',
      message: `O imóvel ${createdProperty.title} foi cadastrado com status ${createdProperty.status}.`,
      data: {
        propertyId: createdProperty.id,
        status: createdProperty.status,
        transactionType: createdProperty.transactionType,
      },
    };

    await this.notification.notifyUsers(
      [createdProperty.realtorId],
      propertyNotification,
    );
    await this.notification.notifyAdmins(propertyNotification);

    return createdProperty;
  }

  async findAll() {
    return this.prisma.property.findMany({
      include: {
        owner: true,
        realtor: true,
      },
    });
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },

      include: {
        owner: true,
        realtor: true,
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto) {
    const propertyExists = await this.prisma.property.findUnique({
      where: { id },
      include: {
        favorites: {
          select: { userId: true },
        },
      },
    });

    if (!propertyExists) {
      throw new NotFoundException('Property not found');
    }

    const shouldNotifyStatusChange =
      updatePropertyDto.status !== undefined &&
      updatePropertyDto.status !== propertyExists.status;

    const oldSalePrice = propertyExists.salePrice;
    const oldRentPrice = propertyExists.rentPrice;

    const updatedProperty = await this.prisma.property.update({
      where: { id },
      data: updatePropertyDto,
    });

    if (shouldNotifyStatusChange) {
      const statusNotification = {
        type: 'PROPERTY_STATUS_CHANGED',
        title: 'Status do imóvel atualizado',
        message: `O imóvel ${updatedProperty.title} mudou de ${propertyExists.status} para ${updatedProperty.status}.`,
        data: {
          propertyId: updatedProperty.id,
          oldStatus: propertyExists.status,
          newStatus: updatedProperty.status,
        },
      };

      await this.notification.notifyUsers(
        [
          updatedProperty.realtorId,
          ...propertyExists.favorites.map((favorite) => favorite.userId),
        ],
        statusNotification,
      );
      await this.notification.notifyAdmins(statusNotification);
    }

    const salePriceDropped =
      oldSalePrice !== null &&
      oldSalePrice !== undefined &&
      updatedProperty.salePrice !== null &&
      updatedProperty.salePrice !== undefined &&
      updatedProperty.salePrice < oldSalePrice;

    if (salePriceDropped) {
      const priceDropNotification = {
        type: 'PRICE_DROPPED',
        title: 'Queda de preço',
        message: `O imóvel ${updatedProperty.title} teve o preço de venda reduzido de R$ ${oldSalePrice} para R$ ${updatedProperty.salePrice}.`,
        data: {
          propertyId: updatedProperty.id,
          priceType: 'sale',
          oldPrice: oldSalePrice,
          newPrice: updatedProperty.salePrice,
        },
      };

      await this.notification.notifyUsers(
        [
          updatedProperty.realtorId,
          ...propertyExists.favorites.map((favorite) => favorite.userId),
        ],
        priceDropNotification,
      );
      await this.notification.notifyAdmins(priceDropNotification);
    }

    const rentPriceDropped =
      oldRentPrice !== null &&
      oldRentPrice !== undefined &&
      updatedProperty.rentPrice !== null &&
      updatedProperty.rentPrice !== undefined &&
      updatedProperty.rentPrice < oldRentPrice;

    if (rentPriceDropped) {
      const priceDropNotification = {
        type: 'PRICE_DROPPED',
        title: 'Queda de preço',
        message: `O imóvel ${updatedProperty.title} teve o valor de locação reduzido de R$ ${oldRentPrice} para R$ ${updatedProperty.rentPrice}.`,
        data: {
          propertyId: updatedProperty.id,
          priceType: 'rent',
          oldPrice: oldRentPrice,
          newPrice: updatedProperty.rentPrice,
        },
      };

      await this.notification.notifyUsers(
        [
          updatedProperty.realtorId,
          ...propertyExists.favorites.map((favorite) => favorite.userId),
        ],
        priceDropNotification,
      );
      await this.notification.notifyAdmins(priceDropNotification);
    }

    return updatedProperty;
  }

  async addImages(id: string, imagePaths: string[]) {
    const propertyExists = await this.prisma.property.findUnique({
      where: { id },
      select: { images: true },
    });

    if (!propertyExists) {
      throw new NotFoundException('Property not found');
    }

    return this.prisma.property.update({
      where: { id },
      data: {
        images: [...propertyExists.images, ...imagePaths],
      },
    });
  }

  async remove(id: string) {
    const propertyExists = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!propertyExists) {
      throw new NotFoundException('Property not found');
    }

    return this.prisma.property.delete({
      where: { id },
    });
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

  async findPropertiesByPriceRange(minPrice: number, maxPrice: number) {
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
