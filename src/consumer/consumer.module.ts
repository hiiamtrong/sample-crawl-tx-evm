import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AssetTokenRepository } from 'src/asset-token/repositories/asset-token.repository';
import { ConsumerController } from 'src/consumer/consumer.controller';
import { ConsumerService } from 'src/consumer/consumer.service';
import { FireblocksModule } from 'src/fireblocks/fireblocks.module';
import { RewardModule } from 'src/reward/reward.module';
import { AppConfigService } from 'src/shared/configs/config.service';
import {
  BLOCKCHAIN_GROUP_ID,
  BLOCKCHAIN_MICROSERVICE,
} from 'src/shared/constants/crawler';
import { SharedModule } from 'src/shared/shared.module';
import { getKafkaConfig } from 'src/shared/utils/kafka';
import { SystemConfigModule } from 'src/system-config/system-config.module';
import { TokenPriceModule } from 'src/token-price/token-price.module';
import { AssetTransactionRepository } from 'src/transaction/repositories/asset-transaction.repository';
import { TransactionModule } from 'src/transaction/transaction.module';
import { UserBalanceModule } from 'src/user-balance/user-balance.module';
import { UserReferralModule } from 'src/user-referral/user-referral.module';
import { UserWalletRepository } from 'src/user-wallet/repositories/user-wallet.repository';
import { UserWalletModule } from 'src/user-wallet/user-wallet.module';

@Module({
  imports: [
    SharedModule,
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
    TransactionModule,
    FireblocksModule,
    UserBalanceModule,
    TokenPriceModule,
    UserReferralModule,
    RewardModule,
    SystemConfigModule,
    UserWalletModule
  ],
  providers: [
    ConsumerService,
    AssetTransactionRepository,
    AssetTokenRepository,
    UserWalletRepository,
  ],
  exports: [ConsumerService],
  controllers: [ConsumerController],
})
export class ConsumerModule { }
