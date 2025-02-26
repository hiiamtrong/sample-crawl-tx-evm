import { Injectable } from "@nestjs/common";
import BigNumber from "bignumber.js";
import { PaginationResponseDto } from "src/shared/dtos/base-api-response.dto";
import { PaginationParamsDto } from "src/shared/dtos/pagination-params.dto";
import { AppLogger } from "src/shared/logger/logger.service";
import { RequestContext } from "src/shared/request-context/request-context.dto";
import { plainToInstanceCustom } from "src/shared/utils/class-transform";
import { UserReferralRepository } from "src/user-referral/repositories/user-referral.repository";

import { BackofficeUserReferralFilterDto, BackofficeUserReferralOutputDto } from "./dtos/backoffice-user-referral.dto";

@Injectable()
export class UserReferralService {
  constructor(
    private readonly logger: AppLogger,
    private readonly repository: UserReferralRepository,
  ) {
    logger.setContext(UserReferralService.name);
  }

  async increaseRewardAmount(
    _: RequestContext,
    userId: string,
    amount: string,
  ) {
    const userReferral = await this.repository.findOne({
      where: { userId },
    });

    if (!userReferral) {
      return;
    }

    userReferral.rewardAmount = new BigNumber(userReferral.rewardAmount)
      .plus(amount)
      .toString();
    return this.repository.save(userReferral);
  }

  async getReferrals(
    ctx: RequestContext,
    filter: BackofficeUserReferralFilterDto,
    pagination: PaginationParamsDto,
  ): Promise<PaginationResponseDto<BackofficeUserReferralOutputDto>> {
    this.logger.log(ctx, `${this.getReferrals.name} was called`);

    const queryBuilder = this.repository
      .createQueryBuilder('userReferral')
      .leftJoinAndSelect('userReferral.user', 'user')
      .leftJoinAndSelect('userReferral.referredByUser', 'referredByUser')
      .skip(pagination.page * pagination.limit)
      .take(pagination.limit);

    if (filter.keyword) {
      queryBuilder.andWhere(
        '(user.email ILIKE :keyword OR referredByUser.email ILIKE :keyword)',
        { keyword: `%${filter.keyword}%` },
      );
    }

    const [referrals, total] = await queryBuilder.getManyAndCount();

    const referralsOutput = referrals.map(referral => ({
      id: referral.id,
      userId: referral.userId,
      referredBy: referral.referredBy,
      rewardAmount: referral.rewardAmount,
      userEmail: referral.user?.email,
      referredByEmail: referral.referredByUser?.email,
      createdAt: referral.createdAt,
    }));

    return plainToInstanceCustom(PaginationResponseDto<BackofficeUserReferralOutputDto>, {
      data: referralsOutput,
      total,
      page: pagination.page,
    });
  }
}
