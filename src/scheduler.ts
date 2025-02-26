import './shared/utils/json';

import { NestFactory } from '@nestjs/core';
import { SchedulersModule } from 'src/scheduler/scheduler.module';
import { initializeTransactionalContext, StorageDriver } from 'typeorm-transactional';

async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });
  const app = await NestFactory.create(SchedulersModule, {
    logger: ['error', 'warn', 'log'],
  });

  await app.init();

}

bootstrap();
