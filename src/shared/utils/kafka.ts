import { createMechanism } from '@jm18457/kafkajs-msk-iam-authentication-mechanism';
import { KafkaConfig } from '@nestjs/microservices/external/kafka.interface';
import { split } from 'lodash';
import { AppConfigService } from 'src/shared/configs/config.service';

const getAWSKafkaConfig = (config: AppConfigService): KafkaConfig => {
  const clientId = config.kafka.clientId;
  const brokers = split(config.kafka.brokers, ',');
  const ssl = config.kafka.ssl;
  const region = config.kafka.region;
  const accessKeyId = config.kafka.accessKeyId;
  const secretAccessKey = config.kafka.secretAccessKey;
  const sasl = createMechanism({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return {
    clientId,
    brokers,
    ssl,
    sasl,
  };
};

export const getKafkaConfig = (config: AppConfigService): KafkaConfig => {
  const provider = config.kafka.provider;
  if (provider === 'aws') {
    return getAWSKafkaConfig(config);
  }
  return {
    clientId: config.kafka.clientId,
    brokers: split(config.kafka.brokers, ','),
  };
};
