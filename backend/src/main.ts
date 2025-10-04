import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './seed.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { join } from 'path';
import * as express from 'express';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Debug path resolution
  const uploadsPath = join(process.cwd(), 'uploads');
  console.log('🔍 Debug Info:');
  console.log('Current working directory:', process.cwd());
  console.log('Uploads path:', uploadsPath);
  console.log('Path exists:', fs.existsSync(uploadsPath));

  // Serve static files from uploads directory with logging middleware
  app.use('/static', (req, res, next) => {
    console.log('📥 Static file request:', req.path);
    next();
  }, express.static(uploadsPath));

  // Run seeding
  const seedService = app.get(SeedService);
  await seedService.seed();

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📁 Serving static files from: ${uploadsPath}`);
}
bootstrap();
