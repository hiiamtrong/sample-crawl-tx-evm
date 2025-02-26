import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetTokenModule } from 'src/asset-token/asset-token.module';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { AppConfigService } from 'src/shared/configs/config.service';
import {
  BLOCKCHAIN_GROUP_ID,
  BLOCKCHAIN_MICROSERVICE,
} from 'src/shared/constants/crawler';
import { getKafkaConfig } from 'src/shared/utils/kafka';
import { SystemConfigModule } from 'src/system-config/system-config.module';
import { TokenPriceModule } from 'src/token-price/token-price.module';
import { TransactionService } from 'src/transaction/services/transaction.service';
import { UserBalanceModule } from 'src/user-balance/user-balance.module';
import { UserWalletModule } from 'src/user-wallet/user-wallet.module';

import { BackofficeTransactionController } from './controllers/backoffice-transaction.controller';
import { TransactionController } from './controllers/transaction.controller';
import { AssetTransaction } from './entities/asset-transaction.entity';
import { AssetTransactionRepository } from './repositories/asset-transaction.repository';
import { BackofficeTransactionService } from './services/ backoffice-transaction.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([AssetTransaction]),
    AssetTokenModule,
    TokenPriceModule,
    UserBalanceModule,
    ClientsModule.registerAsync({
      clients: [
        {
          name: BLOCKCHAIN_MICROSERVICE,
          useFactory: (config: AppConfigService) => {
            return {
              transport: Transport.KAFKA,
              options: {
                client: getKafkaConfig(config),
                consumer: {
                  groupId: BLOCKCHAIN_GROUP_ID,
                },
              },
            };
          },
          inject: [AppConfigService],
        },
      ],
    }),
    SystemConfigModule,
    BlockchainModule,
    UserWalletModule,
  ],
  providers: [
    AssetTransactionRepository,
    TransactionService,
    BackofficeTransactionService,
  ],
  exports: [
    AssetTransactionRepository,
    TransactionService,
    BackofficeTransactionService,
  ],
  controllers: [TransactionController, BackofficeTransactionController],
})
export class TransactionModule {}
