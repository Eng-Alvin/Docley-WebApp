import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
const compression = require('compression');

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security: Set secure HTTP headers
  app.use(helmet());

  // Performance: Compress responses
  app.use(compression());

  // Enable CORS for frontend
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000', 'https://docley.vercel.app'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global validation pipe - auto-reject malformed JSON/data
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true, // Auto-transform payloads to DTO types
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server is listening on port ${port}`);
}
bootstrap();
