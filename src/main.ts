import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { UnknownExceptionFilter } from './common/filters';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  app.use(cookieParser());

  app.useGlobalFilters(new UnknownExceptionFilter());
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('EstateFlow API')
    .setDescription('API para gestão imobiliária')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableCors({
    origin: 'http://localhost:5173', // React Vite
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
