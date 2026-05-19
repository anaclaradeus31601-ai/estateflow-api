import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateOwnerDto } from '../dto/create-owner.dto';
import { UpdateOwnerDto } from '../dto/update-owner.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OwnerAdminService {
  constructor(private prisma: PrismaService) {}
  
  async create(createOwnerDto: CreateOwnerDto) {
    const ownerExists = await this.prisma.owner.findUnique({
      where: { email: createOwnerDto.email },
    });

    if (ownerExists) {
      throw new UnauthorizedException('Owner with this email already exists');
    }

    const cnpjExists = await this.prisma.owner.findUnique({
      where: { cpfCnpj: createOwnerDto.cpfCnpj },
    });

    if (cnpjExists) {
      throw new UnauthorizedException('Owner with this CPF/CNPJ already exists');
    }

    return this.prisma.owner.create({
      data: {
        name: createOwnerDto.name,
        email: createOwnerDto.email,
        phone: createOwnerDto.phone,
        cpfCnpj: createOwnerDto.cpfCnpj,
        address: createOwnerDto.address,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpfCnpj: true,      
      },
    });
  }

  async update(id: string, updateOwnerDto: UpdateOwnerDto) {
    const ownerExists = await this.prisma.owner.findUnique({
      where: { id },
    });

    if (!ownerExists) {
      throw new UnauthorizedException('Owner not found');
    }

    return this.prisma.owner.update({
      where: { id },
      data: {
        name: updateOwnerDto.name,
        email: updateOwnerDto.email,
        phone: updateOwnerDto.phone,
        cpfCnpj: updateOwnerDto.cpfCnpj,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpfCnpj: true,      
      },
    });
  }

  async remove(id: string) {
    const ownerExists = await this.prisma.owner.findUnique({
      where: { id },
    });

    if (!ownerExists) {
      throw new UnauthorizedException('Owner not found');
    }
    return this.prisma.owner.delete({
      where: { id },
    });
  }
}
