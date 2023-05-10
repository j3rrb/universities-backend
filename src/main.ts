import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import { CsrfFilter, nestCsrf } from 'ncsrf';
import { AppModule } from 'src/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      origin: '*',
      credentials: true,
    },
  });

  const logger = new Logger('BOOTSTRAP');

  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new CsrfFilter());
  app.use(nestCsrf());
  app.use(compression());

  const config = new DocumentBuilder()
    .setTitle('Universities API')
    .setVersion('1.0.0')
    .addBearerAuth({
      bearerFormat: 'Bearer',
      type: 'apiKey',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const PORT = +configService.get<number>('PORT') || 3000;

  await app.listen(PORT, () => {
    logger.verbose(`Aplicação iniciada na porta ${PORT}`);
  });

  process.on('SIGTERM', () => {
    console.log('Servidor encerrando...', new Date().toISOString());
    app.close();
  });
}

bootstrap();
