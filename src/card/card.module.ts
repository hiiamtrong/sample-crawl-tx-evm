import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardOrderRepository } from 'src/card/repositories/card-order.repository';
import { CardUserRepository } from 'src/card/repositories/card-user.repository';
import { CartModule } from 'src/cart/cart.module';
import { CountriesModule } from 'src/country/countries.module';
import { RewardModule } from 'src/reward/reward.module';
import { UserModule } from 'src/user/user.module';
import { UserBalanceModule } from 'src/user-balance/user-balance.module';

import { CardSeeder } from '../database/seeders/card.seeder';
import { BackofficeCardController } from './controllers/backoffice-card.controller';
import { BackofficeCardOrderController } from './controllers/backoffice-card-order.controller';
import { UserCardController } from './controllers/user-card.controller';
import { Card } from './entities/card.entity';
import { CardRepository } from './repositories/card.repository';
import { BackofficeCardService } from './services/backoffice-card.service';
import { CardService } from './services/card.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Card]),
    UserBalanceModule,
    CountriesModule,
    RewardModule,
    UserModule,
    CartModule,
  ],
  controllers: [
    BackofficeCardController,
    UserCardController,
    BackofficeCardOrderController,
  ],
  providers: [
    CardService,
    CardSeeder,
    CardUserRepository,
    CardOrderRepository,
    BackofficeCardService,
    CardRepository,
  ],

  exports: [CardService],
})
export class CardModule { }
