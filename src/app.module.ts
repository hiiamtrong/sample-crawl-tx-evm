import { Module } from '@nestjs/common';
import { AssetTokenModule } from 'src/asset-token/asset-token.module';
import { CartModule } from 'src/cart/cart.module';
import { CountriesModule } from 'src/country/countries.module';
import { FireblocksModule } from 'src/fireblocks/fireblocks.module';
import { OperatorModule } from 'src/operator/operator.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { UserWalletModule } from 'src/user-wallet/user-wallet.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CardModule } from './card/card.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SeederModule } from './database/seeders/seeder.module';
import { FAQModule } from './faq/faq.module';
import { SharedModule } from './shared/shared.module';
import { SystemConfigModule } from './system-config/system-config.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    UserModule,
    OperatorModule,
    SystemConfigModule,
    SeederModule,
    CardModule,
    FireblocksModule,
    UserWalletModule,
    CountriesModule,
    AssetTokenModule,
    TransactionModule,
    FAQModule,
    DashboardModule,
    CartModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
