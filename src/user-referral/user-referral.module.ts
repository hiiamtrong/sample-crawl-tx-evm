import { Module } from '@nestjs/common';
import { RewardRepository } from 'src/reward/repositories/reward.repository';
import { UserRepository } from 'src/user/repositories/user.repository';

import { BackofficeUserReferralController } from './controllers/backoffice-user-referral.controller';
import { UserReferralRepository } from './repositories/user-referral.repository';
import { BackofficeUserReferralService } from './services/backoffice-user-referral.service';
import { UserReferralService } from './user-referral.service';

@Module({
  imports: [],
  controllers: [BackofficeUserReferralController],
  providers: [
    UserReferralRepository,
    UserReferralService,
    BackofficeUserReferralService,
    UserRepository,
    RewardRepository,
  ],
  exports: [UserReferralRepository, UserReferralService],
})
export class UserReferralModule { }
