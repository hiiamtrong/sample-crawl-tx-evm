import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserBalance } from './entities/user-balance.entity';
import { UserBalanceRepository } from './repositories/user-balance.repository';
import { UserBalanceService } from './services/user-balance.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserBalance])],
  providers: [UserBalanceService, UserBalanceRepository],
  exports: [UserBalanceService],
})
export class UserBalanceModule {}
