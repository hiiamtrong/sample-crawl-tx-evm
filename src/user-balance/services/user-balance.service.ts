import { Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { USER_BALANCE_LOCK_KEY } from 'src/shared/constants/redis-lock';

import { AppExceptionCode, getAppException } from '../../shared/exceptions/app.exception';
import { AppLogger } from '../../shared/logger/logger.service';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import { RedisLockService } from '../../shared/services/redis-lock.service';
import { UserBalance } from '../entities/user-balance.entity';
import { UserBalanceRepository } from '../repositories/user-balance.repository';

@Injectable()
export class UserBalanceService {
  constructor(
    private readonly repository: UserBalanceRepository,
    private readonly logger: AppLogger,
    private readonly redisLockService: RedisLockService,
  ) {
    this.logger.setContext(UserBalanceService.name);
  }

  async increaseBalance(
    ctx: RequestContext,
    userId: string,
    amount: string,
  ): Promise<UserBalance> {
    this.logger.log(ctx, `${this.increaseBalance.name} was called`);

    return this.redisLockService.withLock(
      USER_BALANCE_LOCK_KEY(userId),
      async () => {
        const userBalance = await this.getOrCreateUserBalance(ctx, userId);
        const newAmount = new BigNumber(userBalance.amount)
          .plus(amount)
          .toString();

        userBalance.amount = newAmount;
        return this.repository.save(userBalance);
      },
    );
  }

  async decreaseBalance(
    ctx: RequestContext,
    userId: string,
    amount: string,
  ): Promise<UserBalance> {
    this.logger.log(ctx, `${this.decreaseBalance.name} was called`);

    return this.redisLockService.withLock(
      USER_BALANCE_LOCK_KEY(userId),
      async () => {
        const userBalance = await this.getOrCreateUserBalance(ctx, userId);
        const newAmount = new BigNumber(userBalance.amount).minus(amount);

        if (newAmount.lessThan(0)) {
          throw getAppException(AppExceptionCode.INSUFFICIENT_BALANCE);
        }
        userBalance.amount = newAmount.toString();
        return this.repository.save(userBalance);
      },
    );
  }

  async getOrCreateUserBalance(
    _: RequestContext,
    userId: string,
  ): Promise<UserBalance> {
    let userBalance = await this.repository.findOneBy({ userId });

    if (!userBalance) {
      userBalance = this.repository.create({
        userId,
        amount: '0',
        lockedAmount: '0',
      });

      await this.repository.save(userBalance);
    }

    return userBalance;
  }
}
