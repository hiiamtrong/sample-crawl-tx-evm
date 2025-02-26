import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDateString, IsEnum } from 'class-validator';
import { EPeriod } from 'src/dashboard/dashboard.constant';

export class UserStatsDto {
  @Expose()
  @ApiProperty()
  totalUsers: number;

  @Expose()
  @ApiProperty()
  totalPurchasedUsers: number;
}

export class RedeemedCardStatsDto {
  @Expose()
  @ApiProperty({ type: 'object', additionalProperties: { type: 'number' } })
  cards: Record<
    string,
    {
      totalCards: number;
      totalRedeemedCards: number;
    }
  >;
}

export class SalesCardsStatsDto {
  @Expose()
  @ApiProperty()
  totalPurchasePrice: number;

  @Expose()
  @ApiProperty({ type: 'object', additionalProperties: { type: 'number' } })
  totalPurchasePriceBySubType: Record<string, number>;
}

export class RevenueTransactionDto {
  @Expose()
  @ApiProperty({ type: 'object', additionalProperties: { type: 'number' } })
  revenueByPeriod: Record<string, number>;

  @Expose()
  @ApiProperty()
  totalRevenue: number;
}

export class RevenueTransactionFilter {
  @ApiProperty({
    default: new Date(),
  })
  @Expose()
  @IsDateString()
  from: Date;

  @ApiProperty({
    default: new Date(),
  })
  @Expose()
  @IsDateString()
  to: Date;

  @ApiProperty({
    default: EPeriod.day,
    enum: EPeriod,
  })
  @Expose()
  @IsEnum(EPeriod)
  period: EPeriod;
}

export class TodayStatsDto {
  @Expose()
  @ApiProperty()
  revenue: {
    todayRevenue: number;
    yesterdayRevenue: number;
  };

  @Expose()
  @ApiProperty()
  views: {
    todayViews: number;
    yesterdayViews: number;
  };
}

export class ViewsStatsDto {
  @Expose()
  @ApiProperty()
  totalViews: number;
}

export class ReferralRewardStatsDto {
  @Expose()
  @ApiProperty({ type: 'object', additionalProperties: { type: 'number' } })
  referralRewardByPeriod: Record<string, number>;

  @Expose()
  @ApiProperty()
  totalReferralReward: number;
}


export class ReferralRewardFilter {
  @ApiProperty({
    default: new Date(),
  })
  @Expose()
  @IsDateString()
  from: Date;

  @ApiProperty({
    default: new Date(),
  })
  @Expose()
  @IsDateString()
  to: Date;

  @ApiProperty({
    default: EPeriod.day,
    enum: EPeriod,
  })
  @Expose()
  @IsEnum(EPeriod)
  period: EPeriod;
}
