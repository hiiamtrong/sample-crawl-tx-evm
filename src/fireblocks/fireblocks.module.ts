import { Fireblocks } from '@fireblocks/ts-sdk';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import {
  FIREBLOCKS_GROUP_ID,
  FIREBLOCKS_MICROSERVICE,
  FIREBLOCKS_SDK,
} from 'src/fireblocks/fireblocks.constant';
import { FireblocksController } from 'src/fireblocks/fireblocks.controller';
import { FireblocksVaultRepository } from 'src/fireblocks/repositories/fireblocks-vault.repository';
import { FireblocksWebhookTransactionRepository } from 'src/fireblocks/repositories/fireblocks-webhook-transaction.repository';
import { FireblocksService } from 'src/fireblocks/services/fireblocks.service';
import { FireblocksCoreService } from 'src/fireblocks/services/fireblocks-core.service';
import { AppConfigService } from 'src/shared/configs/config.service';
import { getKafkaConfig } from 'src/shared/utils/kafka';

import { FireblocksInternalAsset } from './entities/fireblocks-internal-asset.entity';
import { FireblocksInternalWallet } from './entities/fireblocks-internal-wallet.entity';
import { FireblocksVault } from './entities/fireblocks-vault.entity';
import { FireblocksWebhookTransaction } from './entities/fireblocks-webhook-transaction.entity';
import { FireblocksInternalAssetRepository } from './repositories/fireblocks-internal-asset.repository';
import { FireblocksInternalWalletRepository } from './repositories/fireblocks-internal-wallet.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FireblocksInternalAsset,
      FireblocksInternalWallet,
      FireblocksVault,
      FireblocksWebhookTransaction,
    ]),
    ClientsModule.registerAsync({
      clients: [
        {
          name: FIREBLOCKS_MICROSERVICE,
          useFactory: (config: AppConfigService) => {
            return {
              transport: Transport.KAFKA,
              options: {
                client: getKafkaConfig(config),
                consumer: {
                  groupId: FIREBLOCKS_GROUP_ID,
                },
              },
            };
          },
          inject: [AppConfigService],
        },
      ],
    }),
  ],
  providers: [
    {
      provide: FIREBLOCKS_SDK,
      useFactory: (config: AppConfigService) => {
        const apiSecretPath = config.fireblocks.apiSecretPath;
        const endpoint = config.fireblocks.endpoint;
        const apiKey = config.fireblocks.apiKey;
        const secretKey = readFileSync(apiSecretPath, 'utf8');

        const fireblocks = new Fireblocks({
          apiKey,
          basePath: endpoint,
          secretKey,
        });

        return fireblocks;
      },
      inject: [AppConfigService],
    },

    FireblocksInternalAssetRepository,
    FireblocksInternalWalletRepository,
    FireblocksVaultRepository,
    FireblocksWebhookTransactionRepository,
    FireblocksService,
    FireblocksCoreService,
  ],
  controllers: [FireblocksController],
  exports: [
    FireblocksInternalAssetRepository,
    FireblocksInternalWalletRepository,
    FireblocksVaultRepository,
    FireblocksWebhookTransactionRepository,
    FireblocksService,
    FireblocksCoreService,
  ],
})
export class FireblocksModule {}
