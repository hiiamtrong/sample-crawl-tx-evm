import './shared/utils/json';

import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConsumerModule } from 'src/consumer/consumer.module';
import { AppConfigService } from 'src/shared/configs/config.service';
import { BLOCKCHAIN_GROUP_ID } from 'src/shared/constants/crawler';
import { getKafkaConfig } from 'src/shared/utils/kafka';
import { initializeTransactionalContext, StorageDriver } from 'typeorm-transactional';

async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });
  const app = await NestFactory.create(ConsumerModule);
  const config = app.get(AppConfigService);
  await initMicroservices(app, config);
}

bootstrap();

const initMicroservices = async (
  app: INestApplication,
  config: AppConfigService,
) => {
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: getKafkaConfig(config),
      consumer: {
        groupId: BLOCKCHAIN_GROUP_ID,
      },
      run: {
        autoCommit: false,
      },
    },
  });

  await app.startAllMicroservices();
};
