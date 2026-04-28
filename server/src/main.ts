import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (validationErrors) => {
        const messages = validationErrors.flatMap((error) =>
          Object.values(error.constraints ?? {}),
        );

        const priority = [
          'Sentence must be a string',
          'Sentence cannot be empty',
          'Sentence too short to classify',
        ];
        const selected =
          priority.find((message) => messages.includes(message)) ??
          messages[0] ??
          'Validation failed';

        return new BadRequestException(selected);
      },
    }),
  );

  await app.listen(3000);
}

void bootstrap();
