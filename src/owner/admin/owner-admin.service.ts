import { Injectable } from '@nestjs/common';
import { CreateOwnerDto } from '../dto/create-owner.dto';
import { UpdateOwnerDto } from '../dto/update-owner.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CpfCnpjAlreadyExistsException,
  EmailAlreadyExistsException,
  EntityNotFoundException,
} from 'src/common/exceptions';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class OwnerAdminService {
  constructor(
    private prisma: PrismaService,
    private notification: NotificationService,
  ) {}

  async create(createOwnerDto: CreateOwnerDto) {
    const ownerExists = await this.prisma.owner.findUnique({
      where: { email: createOwnerDto.email },
    });

    if (ownerExists) {
      throw new EmailAlreadyExistsException();
    }

    const cnpjExists = await this.prisma.owner.findUnique({
      where: { cpfCnpj: createOwnerDto.cpfCnpj },
    });

    if (cnpjExists) {
      throw new CpfCnpjAlreadyExistsException();
    }

    const createdOwner = await this.prisma.owner.create({
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

    await this.notification.notifyAdmins({
      type: 'OWNER_CREATED',
      title: 'Novo proprietário cadastrado',
      message: `O proprietário ${createdOwner.name} foi cadastrado.`,
      data: {
        ownerId: createdOwner.id,
        email: createdOwner.email,
      },
    });

    return createdOwner;
  }

  async update(id: string, updateOwnerDto: UpdateOwnerDto) {
    const ownerExists = await this.prisma.owner.findUnique({
      where: { id },
    });

    if (!ownerExists) {
      throw new EntityNotFoundException('Proprietário', id);
    }

    const updatedOwner = await this.prisma.owner.update({
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

    await this.notification.notifyAdmins({
      type: 'OWNER_UPDATED',
      title: 'Proprietário atualizado',
      message: `O proprietário ${updatedOwner.name} foi atualizado.`,
      data: {
        ownerId: updatedOwner.id,
      },
    });

    return updatedOwner;
  }

  async remove(id: string) {
    const ownerExists = await this.prisma.owner.findUnique({
      where: { id },
    });

    if (!ownerExists) {
      throw new EntityNotFoundException('Proprietário', id);
    }

    const deletedOwner = await this.prisma.owner.delete({
      where: { id },
    });

    await this.notification.notifyAdmins({
      type: 'OWNER_REMOVED',
      title: 'Proprietário removido',
      message: `O proprietário ${deletedOwner.name} foi removido.`,
      data: {
        ownerId: deletedOwner.id,
      },
    });

    return deletedOwner;
  }
}
