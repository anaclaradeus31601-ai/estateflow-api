import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PropertyamenityPublicService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.propertyAmenity.findMany();
  }

  findOne(id: string) {
    return this.prisma.propertyAmenity.findUnique({
      where: { id },
    });
  }
}
