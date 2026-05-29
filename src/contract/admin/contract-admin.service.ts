import { Injectable } from '@nestjs/common';
import { CreateContractDto } from '../dto/create-contract.dto';
import { UpdateContractDto } from '../dto/update-contract.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContractStatus } from '@prisma/client';
import {
  EntityAlreadyExistsException,
  EntityNotFoundException,
} from 'src/common/exceptions';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class ContractAdminService {
  constructor(
    private prisma: PrismaService,
    private notification: NotificationService,
  ) {}

  async create(createContractDto: CreateContractDto) {
    const contractExists = await this.prisma.contract.findFirst({
      where: {
        propertyId: createContractDto.propertyId,
        clientId: createContractDto.clientId,
        transactionType: createContractDto.transactionType,
        status: createContractDto.status,
        startDate: new Date(createContractDto.startDate),
        endDate: new Date(createContractDto.endDate),
        rentValue: createContractDto.rentValue,
        saleValue: createContractDto.saleValue,
        terms: createContractDto.terms,
        documentUrl: createContractDto.documentUrl,
      },
    });

    if (contractExists) {
      throw new EntityAlreadyExistsException('Contrato já cadastrado');
    }

    const createdContract = await this.prisma.contract.create({
      data: {
        propertyId: createContractDto.propertyId,
        clientId: createContractDto.clientId,
        transactionType: createContractDto.transactionType,
        status: createContractDto.status,
        startDate: new Date(createContractDto.startDate),
        endDate: new Date(createContractDto.endDate),
        rentValue: createContractDto.rentValue,
        saleValue: createContractDto.saleValue,
        terms: createContractDto.terms,
        documentUrl: createContractDto.documentUrl,
      },
    });

    const property = await this.prisma.property.findUnique({
      where: { id: createdContract.propertyId },
      select: { title: true, realtorId: true },
    });

    const contractNotification = {
      type: 'CONTRACT_CREATED',
      title: 'Novo contrato criado',
      message: `Um contrato do imóvel ${property?.title ?? createdContract.propertyId} foi criado com status ${createdContract.status}.`,
      data: {
        contractId: createdContract.id,
        propertyId: createdContract.propertyId,
        status: createdContract.status,
      },
    };

    await this.notification.notifyUsers(
      [createdContract.clientId, property?.realtorId],
      contractNotification,
    );
    await this.notification.notifyAdmins(contractNotification);

    return createdContract;
  }

  async update(id: string, updateContractDto: UpdateContractDto) {
    const contractExists = await this.prisma.contract.findUnique({
      where: { id },
    });

    if (!contractExists) {
      throw new EntityNotFoundException('Contrato', id);
    }

    const updatedContract = await this.prisma.contract.update({
      where: { id },
      data: {
        ...updateContractDto,
        startDate: updateContractDto.startDate
          ? new Date(updateContractDto.startDate)
          : undefined,
        endDate: updateContractDto.endDate
          ? new Date(updateContractDto.endDate)
          : undefined,
      },
    });

    if (
      updateContractDto.status !== undefined &&
      updateContractDto.status !== contractExists.status
    ) {
      const property = await this.prisma.property.findUnique({
        where: { id: updatedContract.propertyId },
        select: { title: true, realtorId: true },
      });

      const statusMessageByStatus: Record<ContractStatus, string> = {
        DRAFT: 'foi colocado em rascunho',
        ACTIVE: 'foi ativado',
        EXPIRED: 'expirou',
        TERMINATED: 'foi encerrado',
        CANCELLED: 'foi cancelado',
      };

      const contractNotification = {
        type: 'CONTRACT_STATUS_CHANGED',
        title: 'Status do contrato atualizado',
        message: `O contrato do imóvel ${property?.title ?? updatedContract.propertyId} ${statusMessageByStatus[updatedContract.status]}.`,
        data: {
          contractId: updatedContract.id,
          propertyId: updatedContract.propertyId,
          oldStatus: contractExists.status,
          newStatus: updatedContract.status,
        },
      };

      await this.notification.notifyUsers(
        [updatedContract.clientId, property?.realtorId],
        contractNotification,
      );
      await this.notification.notifyAdmins(contractNotification);
    }

    return updatedContract;
  }

  async remove(id: string) {
    const contractExists = await this.prisma.contract.findUnique({
      where: { id },
    });

    if (!contractExists) {
      throw new EntityNotFoundException('Contrato', id);
    }

    return this.prisma.contract.delete({
      where: { id },
    });
  }
}
