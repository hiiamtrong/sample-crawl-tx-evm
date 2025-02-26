import { Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { REWARD_LOCK_KEY } from 'src/shared/constants/redis-lock';
import { AdjustUserRewardDto } from 'src/user-balance/dtos/adjust-user-reward.dto';

import {
  AppExceptionCode,
  getAppException,
} from '../../shared/exceptions/app.exception';
import { AppLogger } from '../../shared/logger/logger.service';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import { RedisLockService } from '../../shared/services/redis-lock.service';
import { Reward } from '../entities/reward.entity';
import { RewardRepository } from '../repositories/reward.repository';

@Injectable()
export class RewardService {
  constructor(
    private repository: RewardRepository,
    private readonly logger: AppLogger,
    private readonly redisLockService: RedisLockService,
  ) {
    this.logger.setContext(RewardService.name);
  }

  async increaseReward(
    ctx: RequestContext,
    userId: string,
    amount: string,
  ): Promise<Reward> {
    this.logger.log(ctx, `${this.increaseReward.name} was called`);

    return this.redisLockService.withLock(
      REWARD_LOCK_KEY(userId),
      async () => {
        const reward = await this.getOrCreateReward(ctx, userId);
        const newAmount = new BigNumber(reward.amount)
          .plus(amount)
          .toString();

        reward.amount = newAmount;
        await this.repository.save(reward);
        return reward;
      },
    );
  }

  async decreaseReward(
    ctx: RequestContext,
    userId: string,
    amount: string,
  ): Promise<Reward> {
    this.logger.log(ctx, `${this.decreaseReward.name} was called`);

    return this.redisLockService.withLock(
      REWARD_LOCK_KEY(userId),
      async () => {
        const reward = await this.getOrCreateReward(ctx, userId);
        const newAmount = new BigNumber(reward.amount).minus(amount);

        if (newAmount.lessThan(0)) {
          throw getAppException(AppExceptionCode.INSUFFICIENT_REWARD);
        }
        reward.amount = newAmount.toString();
        await this.repository.save(reward);
        return reward;
      },
    );
  }

  async getOrCreateReward(
    _: RequestContext,
    userId: string,
  ): Promise<Reward> {
    let reward = await this.repository

      .findOneBy({ userId });

    if (!reward) {
      reward = this.repository.create({
        userId,
        amount: '0',
      });

      await this.repository.save(reward);
    }

    return reward;
  }

  async adjustUserReward(
    ctx: RequestContext,
    adjustUserRewardDto: AdjustUserRewardDto,
  ): Promise<Reward> {
    const { userId, amount } = adjustUserRewardDto;
    const reward = await this.getOrCreateReward(ctx, userId);
    await this.redisLockService.withLock(REWARD_LOCK_KEY(userId), async () => {
      reward.amount = amount.toString();
      await this.repository.save(reward);
    });
    return reward;
  }
}
