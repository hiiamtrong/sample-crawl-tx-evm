import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardUserRepository } from 'src/card/repositories/card-user.repository';
import { FireblocksModule } from 'src/fireblocks/fireblocks.module';
import { RewardModule } from 'src/reward/reward.module';
import { BackOfficeUserController } from 'src/user/controllers/backoffice-user.controller';
import { UserBalanceModule } from 'src/user-balance/user-balance.module';
import { UserReferralModule } from 'src/user-referral/user-referral.module';

import { JwtUserAuthStrategy } from '../auth/strategies/jwt-user-auth.strategy';
import { UserController } from './controllers/user.controller';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { BackofficeUserService } from './services/backoffice-user.service';
import { UserService } from './services/user.service';
import { UserAclService } from './services/user-acl.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UserBalanceModule,
    FireblocksModule,
    RewardModule,
    UserReferralModule,
  ],
  providers: [UserService, JwtUserAuthStrategy, UserAclService, UserRepository, CardUserRepository, BackofficeUserService],
  controllers: [UserController, BackOfficeUserController],
  exports: [UserService],
})
export class UserModule { }
