import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { JwtOperatorAuthGuard } from 'src/auth/guards/jwt-operator-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { REFERRAL_PERMISSIONS } from 'src/permission/permission.constant';
import { PaginationResponseDto } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { BackofficeUserReferralFilterDto, BackofficeUserReferralOutputDto, BackofficeUserReferralStatsDto } from 'src/user-referral/dtos/backoffice-user-referral.dto';

import { BackofficeUserReferralService } from '../services/backoffice-user-referral.service';

@ApiBearerAuth()
@ApiTags('Backoffice/User-Referral')
@Controller('backoffice/user-referral')
@UseGuards(JwtOperatorAuthGuard, PermissionsGuard)
export class BackofficeUserReferralController {
  constructor(private readonly backofficeuserReferralService: BackofficeUserReferralService) { }

  @Get()
  @ApiOkResponse({ type: PaginationResponseDto })
  @Permissions(REFERRAL_PERMISSIONS.MANAGE, REFERRAL_PERMISSIONS.READ)
  async getReferrals(
    @Req() ctx: RequestContext,
    @Query() filter: BackofficeUserReferralFilterDto,
    @Query() pagination: PaginationParamsDto,
  ): Promise<PaginationResponseDto<BackofficeUserReferralOutputDto>> {
    return this.backofficeuserReferralService.getReferrals(ctx, filter, pagination);
  }

  @Get('stats')
  @ApiOkResponse({ type: BackofficeUserReferralStatsDto })
  @Permissions(REFERRAL_PERMISSIONS.MANAGE, REFERRAL_PERMISSIONS.READ)
  async referralStats(_: RequestContext) {
    return this.backofficeuserReferralService.referralStats(_);
  }

  @Get(':id')
  @ApiOkResponse({ type: BackofficeUserReferralOutputDto })
  @Permissions(REFERRAL_PERMISSIONS.MANAGE, REFERRAL_PERMISSIONS.READ)
  async getReferralById(
    @Req() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<BackofficeUserReferralOutputDto> {
    return this.backofficeuserReferralService.getReferralById(ctx, id);
  }
} 
