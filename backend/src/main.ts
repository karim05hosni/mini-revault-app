import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config'; // 1. Import ConfigService

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 2. Get ConfigService instance
  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('mini-revolut API')
    .setDescription('The mini-revolut API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
        description: 'Enter your Bearer token',
      },
      'bearer',
    )
    .addSecurityRequirements('bearer')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs/api', app, documentFactory);

  // 3. Use configService.get() for CORS
  app.enableCors({
    origin: [
      configService.get('FRONTEND_URL'), 'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  await app.listen(3000, '0.0.0.0');
}
bootstrap();