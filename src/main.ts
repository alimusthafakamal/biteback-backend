import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BadRequestException, HttpStatus, Logger, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(ConfigService);
  app.enableCors({
    credentials: true,
    origin: '*'
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    exceptionFactory: (errors) => {
      let errorMessages = {};
      errorMessages['statusCode'] = HttpStatus.BAD_REQUEST,
        errors.forEach(error => {
          if (error?.children && error?.children?.length > 0) {
            error.children.forEach(errorItem => {
              errorMessages = { ...nestedError(errorItem, error.property), ...errorMessages }
            })
          } else {
            errorMessages[error.property] = Object.values(error.constraints).join('. ').trim()
          }

          // console.log(error)
        });
      errorMessages['error'] = 'Bad Request'
      return new BadRequestException(errorMessages);
    }
  }));
  const config = new DocumentBuilder()
    .setTitle('Food Transactions RESTful API Server')
    .setDescription('The purpose of this RESTful API Server is for food transactions.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config, { ignoreGlobalPrefix: true, });
  SwaggerModule.setup('api', app, document);
  await app.listen(configService.get<number>('PORT', 3000));
  Logger.log(`Running on port ${configService.get<string>('PORT', '3000')}`);
}

function nestedError(error: ValidationError, parentName: string = null) {
  let errorMessages = {}

  if (error?.children && error?.children?.length > 0) {
    error.children?.forEach(errorItem => {
      errorMessages = { ...nestedError(errorItem, `${parentName !== null && parentName !== '' ? `${parentName}.` : ''}${error.property}`), ...errorMessages }
    })
  } else {
    errorMessages[`${parentName !== null && parentName !== '' ? `${parentName}.` : ''}${error.property}`] = Object.values(error.constraints).join('. ').trim()
  }

  return errorMessages;
}

bootstrap();
