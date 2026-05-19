import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OwnerModule } from './owner/owner.module';
import { PropertyModule } from './property/property.module';
import { AmenityModule } from './amenity/amenity.module';
import { PropertyamenityModule } from './propertyamenity/propertyamenity.module';
import { VisitModule } from './visit/visit.module';
import { ContractModule } from './contract/contract.module';
import { PaymentModule } from './payment/payment.module';
import { SeedService } from './seed/seed.service';

@Module({
  imports: [
    CommonModule,
    UsersModule,
    PrismaModule,
    AuthModule,
    OwnerModule,
    PropertyModule,
    AmenityModule,
    PropertyamenityModule,
    VisitModule,
    ContractModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule {}
