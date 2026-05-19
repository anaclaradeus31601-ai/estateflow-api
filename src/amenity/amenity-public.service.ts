import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AmenityPublicService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.amenity.findMany();
  }

  findOne(id: string) {
    return this.prisma.amenity.findUnique({ where: { id } });
  }
}
