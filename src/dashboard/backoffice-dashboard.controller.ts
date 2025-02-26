import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtOperatorAuthGuard } from 'src/auth/guards/jwt-operator-auth.guard';
import { TIMEZONE_TOKEN_HEADER } from 'src/shared/constants';
import { RequestContext } from 'src/shared/request-context/request-context.dto';

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
import { BackofficeDashboardService } from './backoffice-dashboard.service';

@Controller('backoffice/dashboard')
@ApiTags('Backoffice Dashboard')
@ApiBearerAuth()
@UseGuards(JwtOperatorAuthGuard)
export class BackofficeDashboardController {
  constructor(
    private readonly backofficeDashboardService: BackofficeDashboardService,
  ) { }

  @Get('user-stats')
  @ApiOkResponse({ type: UserStatsDto })
  async getUserStats(@Req() ctx: RequestContext): Promise<UserStatsDto> {
    return this.backofficeDashboardService.getUserStats(ctx);
  }

  @Get('redeemed-card-stats')
  @ApiOkResponse({ type: RedeemedCardStatsDto })
  async getRedeemedCardStats(@Req() ctx: RequestContext): Promise<RedeemedCardStatsDto> {
    return this.backofficeDashboardService.getRedeemedCardStats(ctx);
  }

  @Get('sales-cards-stats')
  @ApiOkResponse({ type: SalesCardsStatsDto })
  async getSalesCardsStats(@Req() ctx: RequestContext): Promise<SalesCardsStatsDto> {
    return this.backofficeDashboardService.getSalesCardsStats(ctx);
  }

  @Get('revenue-stats')
  @ApiOkResponse({ type: RevenueTransactionDto })
  @ApiHeader({
    name: TIMEZONE_TOKEN_HEADER,
    description: 'User timezone (e.g., America/New_York)',
    required: true,
    example: 'Asia/Ho_Chi_Minh',
  })
  async getRevenueStats(
    @Query() filter: RevenueTransactionFilter,
    @Req() ctx: RequestContext,
  ): Promise<RevenueTransactionDto> {
    return this.backofficeDashboardService.getRevenueStats(filter, ctx);
  }

  @Get('today-stats')
  @ApiOkResponse({ type: TodayStatsDto })
  async getTodayStats(@Req() ctx: RequestContext): Promise<TodayStatsDto> {
    return this.backofficeDashboardService.getTodayStats(ctx);
  }

  @Get('views-stats')
  @ApiOkResponse({ type: ViewsStatsDto })
  async getViewsStats(@Req() ctx: RequestContext): Promise<ViewsStatsDto> {
    return this.backofficeDashboardService.getViewsStats(ctx);
  }

  @Get('referral-reward-stats')
  @ApiOkResponse({ type: ReferralRewardStatsDto })
  async getReferralRewardStats(
    @Query() filter: ReferralRewardFilter,
    @Req() ctx: RequestContext,
  ): Promise<ReferralRewardStatsDto> {
    return this.backofficeDashboardService.getReferralRewardStats(ctx, filter);
  }
}
