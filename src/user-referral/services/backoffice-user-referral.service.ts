import { Injectable } from '@nestjs/common';
import { RewardRepository } from 'src/reward/repositories/reward.repository';
import { PaginationResponseDto } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import { AppExceptionCode, getAppException } from 'src/shared/exceptions/app.exception';
import { AppLogger } from 'src/shared/logger/logger.service';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { plainToInstanceCustom } from 'src/shared/utils/class-transform';
import { UserStatus } from 'src/user/entities/user.entity';
import { UserRepository } from 'src/user/repositories/user.repository';
import { UserReferralRepository } from 'src/user-referral/repositories/user-referral.repository';
import { In } from 'typeorm';

import { BackofficeUserReferralFilterDto, BackofficeUserReferralOutputDto, BackofficeUserReferralStatsDto } from '../dtos/backoffice-user-referral.dto';

@Injectable()
export class BackofficeUserReferralService {
  constructor(
    private readonly logger: AppLogger,
    private readonly userReferralRepository: UserReferralRepository,
    private readonly userRepository: UserRepository,
    private readonly userRewardRepository: RewardRepository,
  ) {
    logger.setContext(BackofficeUserReferralService.name);
  }

  async getReferrals(
    ctx: RequestContext,
    filter: BackofficeUserReferralFilterDto,
    pagination: PaginationParamsDto,
  ): Promise<PaginationResponseDto<BackofficeUserReferralOutputDto>> {
    this.logger.log(ctx, `${this.getReferrals.name} was called`);

    const queryBuilder = this.userReferralRepository
      .createQueryBuilder('userReferral')
      .leftJoinAndSelect('userReferral.referredByUser', 'referredByUser')
      .leftJoinAndSelect('userReferral.user', 'user')
      .select([
        'userReferral.referredBy as user_id',
        'COUNT(userReferral.id) as total_referrals',
        'SUM(userReferral.rewardAmount) as total_reward_amount'
      ])
      .where('user.status = :status', { status: UserStatus.ACTIVE })
      .groupBy('userReferral.referredBy')
      .skip(pagination.page * pagination.limit)
      .take(pagination.limit);

    if (filter.keyword) {
      queryBuilder.andWhere(
        '(referredByUser.email ILIKE :keyword)',
        { keyword: `%${filter.keyword}%` },
      );
    }

    const referrals = await queryBuilder.getRawMany();
    const total = referrals.length;

    const userReferrals = await this.userRepository.find({
      where: {
        id: In(referrals.map(referral => referral.user_id)),
      },
    });

    const userRewards = await this.userRewardRepository.find({
      where: {
        userId: In(referrals.map(referral => referral.user_id)),
      },
    });


    const userReferralsMap = new Map(userReferrals.map(user => [user.id, user.email]));
    const userRewardsMap = new Map(userRewards.map(reward => [reward.userId, reward.amount]));
    const referralsOutput = referrals.map(referral => ({
      userId: referral.user_id,
      userEmail: userReferralsMap.get(referral.user_id),
      totalReferrals: parseInt(referral.total_referrals, 10),
      totalRewardAmount: parseFloat(referral.total_reward_amount),
      currentRewardAmount: parseFloat(userRewardsMap.get(referral.user_id) || '0'),
    }));

    return plainToInstanceCustom(PaginationResponseDto<BackofficeUserReferralOutputDto>, {
      data: referralsOutput,
      total,
      page: pagination.page,
    });
  }

  async getReferralById(
    ctx: RequestContext,
    id: string
  ): Promise<BackofficeUserReferralOutputDto> {
    this.logger.log(ctx, `${this.getReferralById.name} was called`);

    const referral = await this.userReferralRepository

      .createQueryBuilder('userReferral')
      .leftJoinAndSelect('userReferral.user', 'user')
      .leftJoinAndSelect('userReferral.referredByUser', 'referredByUser')
      .where('userReferral.id = :id', { id })
      .getOne();

    if (!referral) {
      throw getAppException(AppExceptionCode.USER_REFERRAL_NOT_FOUND);
    }

    return plainToInstanceCustom(BackofficeUserReferralOutputDto, {
      id: referral.id,
      userId: referral.userId,
      referredBy: referral.referredBy,
      rewardAmount: referral.rewardAmount,
      userEmail: referral.user?.email,
      referredByEmail: referral.referredByUser?.email,
      createdAt: referral.createdAt,
    });
  }

  async referralStats(_: RequestContext) {
    // Get total referrals and total rewards
    const totalReferrals = await this.userReferralRepository.count();
    const { totalRewardAmount } = await this.userReferralRepository.createQueryBuilder('userReferral').select('SUM(reward_amount)', 'totalRewardAmount').getRawOne();

    return plainToInstanceCustom(BackofficeUserReferralStatsDto, {
      totalReferrals,
      totalRewardAmount: totalRewardAmount.toString(),
      totalDepositAmount: totalRewardAmount.toString(),
    });
  }
} 
