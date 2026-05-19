import { Injectable } from '@nestjs/common';
import { CreateContractDto } from '../dto/create-contract.dto';
import { UpdateContractDto } from '../dto/update-contract.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  EntityAlreadyExistsException,
  EntityNotFoundException,
} from 'src/common/exceptions';

@Injectable()
export class ContractAdminService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.contract.create({
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
  }

  async update(id: string, updateContractDto: UpdateContractDto) {
    return this.prisma.contract.update({
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
