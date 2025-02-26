import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackofficeUserRewardController } from 'src/user-balance/controllers/backoffice-user-reward.controller';

import { Reward } from './entities/reward.entity';
import { RewardRepository } from './repositories/reward.repository';
import { RewardService } from './services/reward.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reward])],
  providers: [RewardService, RewardRepository],
  controllers: [BackofficeUserRewardController],
  exports: [RewardService],
})
export class RewardModule {}
