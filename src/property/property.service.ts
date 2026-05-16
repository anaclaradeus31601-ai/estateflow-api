import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PropertyService {
  constructor(private readonly prisma: PrismaService) {}

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
    return this.prisma.property.create({
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
    });

    if (!propertyExists) {
      throw new NotFoundException('Property not found');
    }

    return this.prisma.property.update({
      where: { id },
      data: updatePropertyDto,
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
}