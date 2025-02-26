import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import BigNumber from 'bignumber.js';
import { countBy, groupBy, mapValues, sumBy } from 'lodash';
import { EPeriod } from 'src/dashboard/dashboard.constant';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { plainToInstanceCustom } from 'src/shared/utils/class-transform';
import dayjs from 'src/shared/utils/dayjs';
import {
  AssetTransaction,
  AssetTransactionStatusEnum,
  AssetTransactionTypeEnum,
} from 'src/transaction/entities/asset-transaction.entity';
import { Between, In, MoreThan, MoreThanOrEqual, Repository } from 'typeorm';

import { CardOrder } from '../card/entities/card-order.entity';
import { CardUser, ECardUserStatus } from '../card/entities/card-user.entity';
import { User } from '../user/entities/user.entity';
import {
  RedeemedCardStatsDto,
  ReferralRewardFilter,
  ReferralRewardStatsDto,
  RevenueTransactionDto,
  RevenueTransactionFilter,
  SalesCardsStatsDto,
  TodayStatsDto,
  UserStatsDto,
  ViewsStatsDto,
} from './backoffice-dashboard.dto';

@Injectable()
export class BackofficeDashboardService {
  constructor(
    @InjectRepository(CardOrder)
    private cardOrderRepository: Repository<CardOrder>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CardUser)
    private cardUserRepository: Repository<CardUser>,
    @InjectRepository(AssetTransaction)
    private assetTransactionRepository: Repository<AssetTransaction>,
  ) { }

  async getUserStats(_: RequestContext): Promise<UserStatsDto> {
    const totalUsers = await this.userRepository.count();
    const totalPurchasedUsers = await this.cardOrderRepository
      .createQueryBuilder('cardOrder')
      .select('COUNT(DISTINCT cardOrder.userId)', 'count')
      .getRawOne();

    return plainToInstanceCustom(UserStatsDto, {
      totalUsers,
      totalPurchasedUsers: parseInt(totalPurchasedUsers.count, 10),
    });
  }

  async getRedeemedCardStats(_: RequestContext): Promise<RedeemedCardStatsDto> {
    const totalCards = await this.cardUserRepository.find({
      where: {
        status: In([ECardUserStatus.AVAILABLE, ECardUserStatus.REDEEMED]),
      },
      relations: ['card'],
    });

    const redeemedCards = await this.cardUserRepository
      .createQueryBuilder('cardUser')
      .where('cardUser.status = :status', { status: ECardUserStatus.REDEEMED })
      .leftJoinAndSelect('cardUser.card', 'card')
      .getMany();

    const totalCardsBySubType = countBy(totalCards, 'card.subType');
    const totalRedeemedCardsBySubType = countBy(redeemedCards, 'card.subType');
    const result = {};
    for (const subType in totalCardsBySubType) {
      result[subType] = {
        totalCards: totalCardsBySubType[subType],
        totalRedeemedCards: totalRedeemedCardsBySubType[subType] || 0,
      };
    }

    return plainToInstanceCustom(RedeemedCardStatsDto, {
      cards: result,
    });
  }

  async getSalesCardsStats(_: RequestContext): Promise<SalesCardsStatsDto> {
    const result = await this.cardUserRepository.find({
      where: {
        status: In([ECardUserStatus.AVAILABLE, ECardUserStatus.REDEEMED]),
      },
      relations: ['card'],
    });

    const totalPurchasePrice = sumBy(result, (card) =>
      parseFloat(card.purchasePrice),
    );
    const totalCardsBySubType = groupBy(result, 'card.subType');
    const totalPurchasePriceBySubType = mapValues(
      totalCardsBySubType,
      (cards) => sumBy(cards, (card) => parseFloat(card.purchasePrice)),
    );

    return plainToInstanceCustom(SalesCardsStatsDto, {
      totalPurchasePrice,
      totalPurchasePriceBySubType,
    });
  }

  async getRevenueStats(
    filter: RevenueTransactionFilter,
    ctx: RequestContext,
  ): Promise<RevenueTransactionDto> {
    const { from, to, period } = filter;
    const timezone = ctx.timezone;

    // Set from and to to start and end of their respective days
    const fromStartOfDay = dayjs.tz(from, timezone).startOf('day');
    const toEndOfDay = dayjs.tz(to, timezone).endOf('day');

    // Convert dates to UTC
    const fromUTC = fromStartOfDay.utc().toDate();
    const toUTC = toEndOfDay.utc().toDate();


    const totalDepositTransactions = await this.assetTransactionRepository.find(
      {
        where: {
          type: AssetTransactionTypeEnum.deposit,
          status: AssetTransactionStatusEnum.completed,
          createdAt: Between(fromUTC, toUTC),
        },
      },
    );

    const totalWithdrawalTransactions =
      await this.assetTransactionRepository.find({
        where: {
          type: AssetTransactionTypeEnum.withdraw,
          status: AssetTransactionStatusEnum.completed,
          createdAt: Between(fromUTC, toUTC),
        },
      });

    // Calculate total deposit and withdrawal amounts
    const totalDeposit = totalDepositTransactions.reduce(
      (sum, tx) => sum.plus(tx.finalUsdAmount),
      new BigNumber(0),
    );
    const totalWithdrawal = totalWithdrawalTransactions.reduce(
      (sum, tx) => sum.plus(tx.finalUsdAmount),
      new BigNumber(0),
    );

    // Calculate revenue
    const revenue = totalDeposit.minus(totalWithdrawal);

    // Use the timezone when grouping transactions
    const groupedDeposits = this.groupTransactionsByPeriod(
      fromUTC,
      toUTC,
      totalDepositTransactions,
      period,
      timezone,
    );


    const groupedWithdrawals = this.groupTransactionsByPeriod(
      fromUTC,
      toUTC,
      totalWithdrawalTransactions,
      period,
      timezone,
    );

    // Calculate revenue for each period
    const revenueByPeriod = {};
    for (const key in groupedDeposits) {
      const periodDeposit = groupedDeposits[key].reduce(
        (sum, tx) => sum.plus(tx.finalUsdAmount),
        new BigNumber(0),
      );
      const periodWithdrawal = (groupedWithdrawals[key] || []).reduce(
        (sum, tx) => sum.plus(tx.finalUsdAmount),
        new BigNumber(0),
      );
      revenueByPeriod[key] = periodDeposit.minus(periodWithdrawal).toString();
    }

    return plainToInstanceCustom(RevenueTransactionDto, {
      totalRevenue: revenue.toString(),
      revenueByPeriod,
    });
  }

  private groupTransactionsByPeriod(
    from: Date,
    to: Date,
    transactions: AssetTransaction[],
    period: EPeriod,
    timezone: string,
  ) {
    const startDate = dayjs.tz(from, timezone);
    const endDate = dayjs.tz(to, timezone);
    const periodTransactions = {};

    // Generate default periods with value 0
    let currentDate = startDate;
    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
      const key = this.getPeriodKey(currentDate, period);
      periodTransactions[key] = [];

      // Move to the next period
      switch (period) {
        case EPeriod.day:
          currentDate = currentDate.add(1, 'day');
          break;
        case EPeriod.week:
          currentDate = currentDate.add(1, 'week');
          break;
        case EPeriod.month:
          currentDate = currentDate.add(1, 'month');
          break;
        case EPeriod.year:
          currentDate = currentDate.add(1, 'year');
          break;
      }
    }

    // Group actual transactions
    transactions.forEach((tx) => {
      const txDate = dayjs.tz(tx.createdAt, timezone);
      const key = this.getPeriodKey(txDate, period);
      if (periodTransactions[key]) {
        periodTransactions[key].push(tx);
      }
    });

    return periodTransactions;
  }

  private getPeriodKey(date: dayjs.Dayjs, period: EPeriod): string {
    switch (period) {
      case EPeriod.day:
        return date.format('YYYY-MM-DD');
      case EPeriod.week:
        return `${date.format('YYYY')}-W${date.format('WW')}`;
      case EPeriod.month:
        return date.format('YYYY-MM');
      case EPeriod.year:
        return date.format('YYYY');
    }
  }

  async getTodayStats(ctx: RequestContext): Promise<TodayStatsDto> {
    const timezone = ctx.timezone;

    const todayStartOfDay = dayjs.tz(new Date(), timezone).startOf('day');
    const todayStartOfDayUTC = todayStartOfDay.utc().toDate();


    const totalTodayDepositTransactions =
      await this.assetTransactionRepository.find({
        where: {
          createdAt: MoreThanOrEqual(todayStartOfDayUTC),
          type: AssetTransactionTypeEnum.deposit,
          status: AssetTransactionStatusEnum.completed,
        },
      });

    const totalTodayWithdrawalTransactions =
      await this.assetTransactionRepository.find({
        where: {
          createdAt: MoreThanOrEqual(todayStartOfDayUTC),
          type: AssetTransactionTypeEnum.withdraw,
          status: AssetTransactionStatusEnum.completed,
        },
      });

    const totalTodayDepositAmount = totalTodayDepositTransactions.reduce(
      (sum, tx) => sum.plus(tx.finalUsdAmount),
      new BigNumber(0),
    );
    const totalTodayWithdrawalAmount = totalTodayWithdrawalTransactions.reduce(
      (sum, tx) => sum.plus(tx.finalUsdAmount),
      new BigNumber(0),
    );

    const todayRevenue = totalTodayDepositAmount.minus(
      totalTodayWithdrawalAmount,
    );

    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    const totalYesterdayDepositTransactions =
      await this.assetTransactionRepository.find({
        where: {
          createdAt: Between(
            new Date(yesterday.setHours(0, 0, 0, 0)),
            new Date(yesterday.setHours(23, 59, 59, 999)),
          ),
          type: AssetTransactionTypeEnum.deposit,
          status: AssetTransactionStatusEnum.completed,
        },
      });

    const totalYesterdayWithdrawalTransactions =
      await this.assetTransactionRepository.find({
        where: {
          createdAt: Between(
            new Date(yesterday.setHours(0, 0, 0, 0)),
            new Date(yesterday.setHours(23, 59, 59, 999)),
          ),
          type: AssetTransactionTypeEnum.withdraw,
          status: AssetTransactionStatusEnum.completed,
        },
      });

    const totalYesterdayDepositAmount =
      totalYesterdayDepositTransactions.reduce(
        (sum, tx) => sum.plus(tx.finalUsdAmount),
        new BigNumber(0),
      );
    const totalYesterdayWithdrawalAmount =
      totalYesterdayWithdrawalTransactions.reduce(
        (sum, tx) => sum.plus(tx.finalUsdAmount),
        new BigNumber(0),
      );

    const yesterdayRevenue = totalYesterdayDepositAmount.minus(
      totalYesterdayWithdrawalAmount,
    );

    return plainToInstanceCustom(TodayStatsDto, {
      revenue: {
        todayRevenue: todayRevenue.toNumber(),
        yesterdayRevenue: yesterdayRevenue.toNumber(),
      },
      views: {
        todayViews: 0,
        yesterdayViews: 0,
      },
    });
  }

  async getViewsStats(_: RequestContext): Promise<ViewsStatsDto> {
    return plainToInstanceCustom(ViewsStatsDto, {
      totalViews: 0,
    });
  }

  async getReferralRewardStats(
    ctx: RequestContext,
    filter: ReferralRewardFilter,
  ): Promise<ReferralRewardStatsDto> {
    const { from, to, period } = filter;
    const timezone = ctx.timezone;

    const fromStartOfDay = dayjs.tz(from, timezone).startOf('day');
    const toEndOfDay = dayjs.tz(to, timezone).endOf('day');

    const fromUTC = fromStartOfDay.utc().toDate();
    const toUTC = toEndOfDay.utc().toDate();

    const totalReferralRewardTransactions = await this.assetTransactionRepository.find({
      where: {
        createdAt: Between(fromUTC, toUTC),
        referralRewardAmount: MoreThan('0'),
      },
    });

    const groupedReferralRewardTransactions = this.groupTransactionsByPeriod(
      fromUTC,
      toUTC,
      totalReferralRewardTransactions,
      period,
      timezone,
    );

    const totalReferralReward = totalReferralRewardTransactions.reduce(
      (sum, tx) => sum.plus(tx.referralRewardAmount),
      new BigNumber(0),
    );

    const referralRewardByPeriod = {};
    for (const key in groupedReferralRewardTransactions) {
      const periodReferralReward = groupedReferralRewardTransactions[key].reduce(
        (sum, tx) => sum.plus(tx.referralRewardAmount),
        new BigNumber(0),
      );
      referralRewardByPeriod[key] = periodReferralReward.toString();
    }

    return plainToInstanceCustom(ReferralRewardStatsDto, {
      totalReferralReward: totalReferralReward.toString(),
      referralRewardByPeriod,
    });
  }
}
