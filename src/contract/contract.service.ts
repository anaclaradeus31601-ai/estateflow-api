import { Injectable } from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ContractService {

  constructor(private prisma: PrismaService) { }

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
        documentUrl: createContractDto.documentUrl
      }
    })

    if (contractExists) {
      throw new Error('Contract already exists');
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
        documentUrl: createContractDto.documentUrl
      }
    })
  }

  findAll() {
    return this.prisma.contract.findMany();
  }

  findOne(id: string) {
    return this.prisma.contract.findUnique({
      where: {
        id
      }
    });
  }

  update(id: string, updateContractDto: UpdateContractDto) {
    return this.prisma.contract.update({
      where: {
        id
      },
      data: {
        ...updateContractDto,
        startDate: updateContractDto.startDate ? new Date(updateContractDto.startDate) : undefined,
        endDate: updateContractDto.endDate ? new Date(updateContractDto.endDate) : undefined,
      }
    });
  }

  remove(id: string) {

    const contractExists = this.prisma.contract.findUnique({
      where: {
        id
      }
    })

    if (!contractExists) {
      throw new Error('Contract not found');
    }

    return this.prisma.contract.delete({
      where: {
        id
      }
    });
  }

  async findExpiringContracts() {
    const today = new Date();

    const next30Days = new Date();

    next30Days.setDate(today.getDate() + 30);

    return this.prisma.contract.findMany({
      where: {
        endDate: {
          gte: today,
          lte: next30Days,
        },
        status: 'ACTIVE',
      },
    });
  }

  async findOverdueContracts() {
    const today = new Date();

    return this.prisma.contract.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          not: null,
          lte: today,
        },
      },
      orderBy: {
        endDate: 'asc',
      },
      include: {
        client: true,
        property: true,
      },
    });
  }

  async findContractsByClient(clientId: string) {
    return this.prisma.contract.findMany({
      where: {
        clientId
      },
      include: {
        property: true,
      }
    });
  }

  async findContractsByProperty(propertyId: string) {
    return this.prisma.contract.findMany({
      where: {
        propertyId
      },
      include: {
        client: true,
      }
    });
  }
}
