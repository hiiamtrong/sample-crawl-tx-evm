import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NetworkEnum } from 'src/network/network.constant';
import { SYSTEM_CONFIG_PERMISSIONS } from 'src/permission/permission.constant';
import { SwaggerBaseApiResponse } from 'src/shared/dtos/base-api-response.dto';

import { Permissions } from '../../auth/decorators/permissions.decorator';
import { JwtOperatorAuthGuard } from '../../auth/guards/jwt-operator-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { ReqContext } from '../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import {
  SystemConfigFundHolderAccountOutputDto,
  SystemConfigOutputDto,
} from '../dtos/system-config-output.dto';
import {
  UpdateFundHolderAccountDto,
  UpdateMinDepositAmountUsd,
  UpdateMinWithdrawalAmountUsd,
  UpdateReferralRewardPercentageDto,
  UpdateWithdrawalFeeRateDto,
} from '../dtos/update-system-config.dto';
import { SystemConfigService } from '../services/system-config.service';

@ApiBearerAuth()
@ApiTags('Backoffice/System Config')
@Controller('backoffice/system-config')
@UseGuards(JwtOperatorAuthGuard, PermissionsGuard)
export class BackofficeSystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) { }

  @Get()
  @ApiOperation({ summary: 'Get all system configs' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([SystemConfigOutputDto]),
  })
  @Permissions(SYSTEM_CONFIG_PERMISSIONS.MANAGE, SYSTEM_CONFIG_PERMISSIONS.READ)
  async findAll(
    @ReqContext() ctx: RequestContext,
  ): Promise<SystemConfigOutputDto[]> {
    return this.systemConfigService.findAll(ctx);
  }

  @Get('withdrawal-fee-rate')
  @ApiOperation({ summary: 'Get a system config by key' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(SystemConfigOutputDto),
  })
  @Permissions(SYSTEM_CONFIG_PERMISSIONS.MANAGE, SYSTEM_CONFIG_PERMISSIONS.READ)
  async findOne(@ReqContext() ctx: RequestContext): Promise<number> {
    return this.systemConfigService.getWithdrawalFeeRate(ctx);
  }

  @Put('withdrawal-fee-rate')
  @ApiOperation({ summary: 'Update a system config by key' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(SystemConfigOutputDto),
  })
  @Permissions(SYSTEM_CONFIG_PERMISSIONS.MANAGE, SYSTEM_CONFIG_PERMISSIONS.READ)
  async updateWithdrawalFeeRate(
    @ReqContext() ctx: RequestContext,
    @Body() body: UpdateWithdrawalFeeRateDto,
  ): Promise<SystemConfigOutputDto> {
    return this.systemConfigService.updateWithdrawalFeeRate(ctx, body);
  }

  @Get('referral-reward-percentage')
  @ApiOperation({ summary: 'Get a system config by key' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(SystemConfigOutputDto),
  })
  @Permissions(SYSTEM_CONFIG_PERMISSIONS.MANAGE, SYSTEM_CONFIG_PERMISSIONS.READ)
  async getReferralRewardPercentage(
    @ReqContext() ctx: RequestContext,
  ): Promise<number> {
    return this.systemConfigService.getReferralRewardPercentage(ctx);
  }

  @Put('referral-reward-percentage')
  @ApiOperation({ summary: 'Update a system config by key' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(SystemConfigOutputDto),
  })
  @Permissions(SYSTEM_CONFIG_PERMISSIONS.MANAGE, SYSTEM_CONFIG_PERMISSIONS.READ)
  async updateReferralRewardPercentage(
    @ReqContext() ctx: RequestContext,
    @Body() body: UpdateReferralRewardPercentageDto,
  ): Promise<SystemConfigOutputDto> {
    return this.systemConfigService.updateReferralRewardPercentage(ctx, body);
  }

  @Get('fund-holder-account')
  @ApiOperation({ summary: 'Get a system config by key' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(SystemConfigOutputDto),
  })
  @Permissions(SYSTEM_CONFIG_PERMISSIONS.MANAGE, SYSTEM_CONFIG_PERMISSIONS.READ)
  async getFundHolderAccount(
    @ReqContext() ctx: RequestContext,
  ): Promise<SystemConfigFundHolderAccountOutputDto[]> {
    return this.systemConfigService.getFundHolderAccount(ctx);
  }

  @Put('fund-holder-account/:network')
  @ApiOperation({ summary: 'Update a system config by key' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(SystemConfigOutputDto),
  })
  @Permissions(SYSTEM_CONFIG_PERMISSIONS.MANAGE, SYSTEM_CONFIG_PERMISSIONS.READ)
  async updateFundHolderAccount(
    @ReqContext() ctx: RequestContext,
    @Param('network') network: NetworkEnum,
    @Body() body: UpdateFundHolderAccountDto,
  ): Promise<SystemConfigOutputDto> {
    return this.systemConfigService.updateFundHolderAccount(ctx, network, body);
  }

  @Get('fund-holder-account/:network/request-update')
  @ApiOperation({ summary: 'Request update fund holder account' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(SystemConfigOutputDto),
  })
  @Permissions(SYSTEM_CONFIG_PERMISSIONS.MANAGE, SYSTEM_CONFIG_PERMISSIONS.READ)
  async requestUpdateFundHolderAccount(
    @ReqContext() ctx: RequestContext,
    @Param('network') network: NetworkEnum,
  ): Promise<{ success: boolean }> {
    return this.systemConfigService.requestUpdateFundHolderAccount(
      ctx,
      network,
    );
  }

  @Get('min-deposit-amount-usd')
  @ApiOperation({ summary: 'Get a system config by key' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(SystemConfigOutputDto),
  })
  @Permissions(SYSTEM_CONFIG_PERMISSIONS.MANAGE, SYSTEM_CONFIG_PERMISSIONS.READ)
  async getMinDepositAmountUsd(@ReqContext() ctx: RequestContext): Promise<number> {
    return this.systemConfigService.getMinDepositAmountUsd(ctx);
  }

  @Put('min-deposit-amount-usd')
  @ApiOperation({ summary: 'Update a system config by key' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(SystemConfigOutputDto),
  })
  @Permissions(SYSTEM_CONFIG_PERMISSIONS.MANAGE, SYSTEM_CONFIG_PERMISSIONS.UPDATE)
  async updateMinDepositAmountUsd(
    @ReqContext() ctx: RequestContext,
    @Body() body: UpdateMinDepositAmountUsd,
  ): Promise<SystemConfigOutputDto> {
    return this.systemConfigService.updateMinDepositAmountUsd(ctx, body);
  }

  @Get('min-withdrawal-amount-usd')
  @ApiOperation({ summary: 'Get a system config by key' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(SystemConfigOutputDto),
  })
  @Permissions(SYSTEM_CONFIG_PERMISSIONS.MANAGE, SYSTEM_CONFIG_PERMISSIONS.READ)
  async getMinWithdrawalAmountUsd(@ReqContext() ctx: RequestContext): Promise<number> {
    return this.systemConfigService.getMinWithdrawalAmountUsd(ctx);
  }

  @Put('min-withdrawal-amount-usd')
  @ApiOperation({ summary: 'Update a system config by key' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(SystemConfigOutputDto),
  })
  @Permissions(SYSTEM_CONFIG_PERMISSIONS.MANAGE, SYSTEM_CONFIG_PERMISSIONS.UPDATE)
  async updateMinWithdrawalAmountUsd(
    @ReqContext() ctx: RequestContext,
    @Body() body: UpdateMinWithdrawalAmountUsd,
  ): Promise<SystemConfigOutputDto> {
    return this.systemConfigService.updateMinWithdrawalAmountUsd(ctx, body);
  }
}
