import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(private prisma: PrismaService) {}

  async onApplicationBootstrap() {
    console.log('🌱 Iniciando seed...');

    await this.deleteAll();
    await this.createAll();

    console.log('✅ Seed finalizada');
  }

  async deleteAll() {
    // ORDEM IMPORTA
    await this.prisma.session.deleteMany();
    await this.prisma.payment.deleteMany();
    await this.prisma.visit.deleteMany();
    await this.prisma.contract.deleteMany();
    await this.prisma.property.deleteMany();
    await this.prisma.owner.deleteMany();
    await this.prisma.amenity.deleteMany();
    await this.prisma.propertyAmenity.deleteMany();
    await this.prisma.user.deleteMany();

    console.log('🗑️ Tudo apagado');
  }

  async createAll() {
    const password = await bcrypt.hash('123456', 10);

    // USERS
    await this.prisma.user.createMany({
      data: [
        {
          id: '1',
          name: 'Ana Realtor',
          email: 'anarealtor@example.com',
          password: await bcrypt.hash('123456', 10),
          role: 'REALTOR',
        },
        {
          id: '2',
          name: 'realtor 2',
          email: 'xtt@example.com',
          password,
          role: 'REALTOR',
        },
        {
          id: '3',
          name: 'realtor 3',
          email: 'xmm@example.com',
          password,
          role: 'REALTOR',
        },
        {
          id: '4',
          name: 'Admin',
          email: 'admin@example.com',
          password: await bcrypt.hash('admin123', 10),
          role: 'ADMIN',
        },
        {
          id: '5',
          name: 'Client 1',
          email: 'client1@example.com',
          password,
          role: 'CLIENT',
        },
        {
          id: '6',
          name: 'Client 2',
          email: 'client2@example.com',
          password,
          role: 'CLIENT',
        },
        {
          id: '7',
          name: 'Client 3',
          email: 'client3@example.com',
          password,
          role: 'CLIENT',
        },
      ],
    });

    // OWNERS
    await this.prisma.owner.createMany({
      data: [
        {
          id: '1',
          name: 'Owner 1',
          email: 'owner1@example.com',
          phone: '11999999999',
          cpfCnpj: '123456789',
          address: 'Rua A',
        },
        {
          id: '2',
          name: 'Owner 2',
          email: 'owner2@example.com',
          phone: '11999999998',
          cpfCnpj: '987654321',
          address: 'Rua B',
        },
      ],
    });

    // PROPERTIES
    await this.prisma.property.createMany({
      data: [
        {
          id: '1',
          title: 'Property 1',
          street: 'Rua 1',
          number: '123',
          city: 'Araraquara',
          neighborhood: 'Centro',
          state: 'SP',
          zipCode: '14800000',
          bathrooms: 2,
          bedrooms: 3,
          garages: 1,
          area: 100,
          rentPrice: 2500,
          salePrice: 500000,
          condominiumFee: 300,
          iptu: 120,
          transactionType: 'RENT',
          description: 'Casa bonita',
          type: 'RESIDENTIAL',
          status: 'AVAILABLE',
          ownerId: '1',
          realtorId: '1',
        },
        {
          id: '2',
          title: 'Property 2',
          street: 'Rua 2',
          number: '456',
          city: 'Araraquara',
          neighborhood: 'Centro',
          state: 'SP',
          zipCode: '14800000',
          bathrooms: 1,
          bedrooms: 2,
          garages: 1,
          area: 80,
          rentPrice: 1800,
          salePrice: 350000,
          condominiumFee: 250,
          iptu: 90,
          transactionType: 'RENT',
          description: 'Apartamento',
          type: 'RESIDENTIAL',
          status: 'AVAILABLE',
          ownerId: '2',
          realtorId: '2',
        },
      ],
    });

    // CONTRACTS
    await this.prisma.contract.createMany({
      data: [
        {
          id: '1',
          startDate: new Date(),
          endDate: new Date(),
          propertyId: '1',
          clientId: '5',
          terms: 'Contrato padrão',
          transactionType: 'RENT',
          status: 'ACTIVE',
        },
      ],
    });

    // PAYMENTS
    await this.prisma.payment.createMany({
      data: [
        {
          contractId: '1',
          amount: 2500,
          userId: '5',
          dueDate: new Date(),
          paidDate: new Date(),
          status: 'COMPLETED',
        },
      ],
    });

    // VISITS
    await this.prisma.visit.createMany({
      data: [
        {
          scheduledAt: new Date(),
          propertyId: '1',
          clientId: '5',
          realtorId: '1',
          duration: 60,
          status: 'SCHEDULED',
        },
      ],
    });

    // AMENITIES
    await this.prisma.amenity.createMany({
      data: [
        {
          id: '1',
          name: 'Piscina',
          category: 'Lazer',
          icon: 'pool',
        },
      ],
    });
    //amenity property
    // PROPERTY AMENITIES
    await this.prisma.propertyAmenity.createMany({
      data: [
        {
          propertyId: '1',
          amenityId: '1',
        },
        {
          propertyId: '2',
          amenityId: '1',
        },
      ],
    });
    const users = await this.prisma.user.findMany({
      where: {
        role: 'ADMIN',
      },
    });
    console.log('Admins:', JSON.stringify(users, null, 2));
    console.log('🌱 Dados criados');
  }
}
