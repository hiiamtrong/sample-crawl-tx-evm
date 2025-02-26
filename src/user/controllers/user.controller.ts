import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RewardOutput } from 'src/reward/dtos/reward-output.dto';
import { AddReferralInput, UpdateAliasInput } from 'src/user/dtos/user.dto';
import { UserBalanceOutput } from 'src/user-balance/dtos/user-balance-output.dto';

import { JwtUserAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  BaseApiErrorResponse,
  SwaggerBaseApiResponse,
} from '../../shared/dtos/base-api-response.dto';
import { AppLogger } from '../../shared/logger/logger.service';
import { ReqContext } from '../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import { UserOutput, UserReferralCodeOutput } from '../dtos/user-output.dto';
import { UpdateUserInput } from '../dtos/user-update.dto';
import { UserService } from '../services/user.service';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(UserController.name);
  }

  @UseGuards(JwtUserAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('me')
  @ApiOperation({
    summary: 'Get user me API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(UserOutput),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async getMyProfile(@ReqContext() ctx: RequestContext): Promise<UserOutput> {
    this.logger.log(ctx, `${this.getMyProfile.name} was called`);

    const user = await this.userService.findById(ctx, ctx.user.id);
    return user;
  }

  @UseGuards(JwtUserAuthGuard)
  @Patch('me')
  @ApiOperation({
    summary: 'Update user API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(UserOutput),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async updateUser(
    @ReqContext() ctx: RequestContext,
    @Param('id') userId: string,
    @Body() input: UpdateUserInput,
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.updateUser.name} was called`);

    const user = await this.userService.updateUser(ctx, userId, input);
    return user;
  }

  @UseGuards(JwtUserAuthGuard)
  @Get('me/balance')
  @ApiOperation({
    summary: 'Get user balance API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(UserBalanceOutput),
  })
  async getUserBalance(
    @ReqContext() ctx: RequestContext,
  ): Promise<UserBalanceOutput> {
    this.logger.log(ctx, `${this.getUserBalance.name} was called`);

    const userBalance = await this.userService.getUserBalance(ctx, ctx.user.id);
    return userBalance;
  }

  @UseGuards(JwtUserAuthGuard)
  @Get('me/reward')
  async getUserReward(
    @ReqContext() ctx: RequestContext,
  ): Promise<RewardOutput> {
    this.logger.log(ctx, `${this.getUserReward.name} was called`);

    const userReward = await this.userService.getUserReward(ctx, ctx.user.id);
    return userReward;
  }

  @UseGuards(JwtUserAuthGuard)
  @Get('me/referral-info')
  @ApiOperation({
    summary: 'Get user referral info API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(UserReferralCodeOutput),
  })
  async getUserReferralInfo(
    @ReqContext() ctx: RequestContext,
  ): Promise<UserReferralCodeOutput> {
    this.logger.log(ctx, `${this.getUserReferralInfo.name} was called`);

    const userReferralCode = await this.userService.getUserReferralInfo(ctx, ctx.user.id);
    return userReferralCode;
  }

  @UseGuards(JwtUserAuthGuard)
  @Patch('me/referral')
  async addReferral(
    @ReqContext() ctx: RequestContext,
    @Body() input: AddReferralInput,
  ): Promise<void> {
    this.logger.log(ctx, `${this.addReferral.name} was called`);
    await this.userService.addReferral(ctx, ctx.user.id, input.referralCode);
  }

  @UseGuards(JwtUserAuthGuard)
  @Patch('me/toggle-hidden')
  async toggleHidden(
    @ReqContext() ctx: RequestContext,
  ): Promise<void> {
    await this.userService.toggleHidden(ctx, ctx.user.id);
  }

  @UseGuards(JwtUserAuthGuard)
  @Patch('me/alias')
  async updateAlias(
    @ReqContext() ctx: RequestContext,
    @Body() input: UpdateAliasInput,
  ): Promise<void> {
    await this.userService.updateAlias(ctx, ctx.user.id, input.alias);
  }
}
