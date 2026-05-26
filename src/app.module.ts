import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
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
import { AuditModule } from './audit/audit.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
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
    AuditModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SeedService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
