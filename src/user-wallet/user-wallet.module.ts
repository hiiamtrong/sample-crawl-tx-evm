import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetTokenModule } from 'src/asset-token/asset-token.module';
import { FireblocksModule } from 'src/fireblocks/fireblocks.module';
import { UserWalletController } from 'src/user-wallet/user-wallet.controller';
import { UserWalletService } from 'src/user-wallet/user-wallet.service';

import { UserWallet } from './entities/user-wallet.entity';
import { UserWalletRepository } from './repositories/user-wallet.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserWallet]),
    AssetTokenModule,
    FireblocksModule,
  ],
  providers: [UserWalletService, UserWalletRepository],
  exports: [UserWalletService, UserWalletRepository],
  controllers: [UserWalletController],
})
export class UserWalletModule {}
