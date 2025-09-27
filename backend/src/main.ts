import { NestFactory } from '@nestjs/core';
import { SimpleAppModule } from './simple-app.module';

async function bootstrap() {
  const app = await NestFactory.create(SimpleAppModule);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
