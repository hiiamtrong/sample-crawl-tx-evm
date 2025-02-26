import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetTransaction } from 'src/transaction/entities/asset-transaction.entity';

import { CardOrder } from '../card/entities/card-order.entity';
import { CardUser } from '../card/entities/card-user.entity';
import { User } from '../user/entities/user.entity';
import { BackofficeDashboardController } from './backoffice-dashboard.controller';
import { BackofficeDashboardService } from './backoffice-dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([CardOrder, User, CardUser, AssetTransaction])],
  controllers: [BackofficeDashboardController],
  providers: [BackofficeDashboardService],
})
export class DashboardModule {}
