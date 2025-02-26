import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OperatorChangePasswordInput } from 'src/auth/dtos/operator-auth-change-password.dto';
import { OperatorForgotPasswordInput } from 'src/auth/dtos/operator-auth-forgot-password.dto';
import { OperatorRefreshTokenInput } from 'src/auth/dtos/operator-auth-refresh-token.dto';
import { OperatorAuthResendOtpInput } from 'src/auth/dtos/operator-auth-resend-otp.dto';
import { OperatorResetPasswordInput } from 'src/auth/dtos/operator-auth-reset-password.dto';
import { OperatorAuthTokenOutput } from 'src/auth/dtos/operator-auth-token.dto';
import { OperatorAuthVerityOtpInput } from 'src/auth/dtos/operator-auth-verity-otp.dto';
import { OperatorLoginInput } from 'src/auth/dtos/operator-user-auth-login.dto';
import { JwtOperatorAuthGuard } from 'src/auth/guards/jwt-operator-auth.guard';
import { JwtOperatorRefreshGuard } from 'src/auth/guards/jwt-operator-refresh.guard';
import { LocalOperatorAuthGuard } from 'src/auth/guards/local-operator-auth.guard';
import { OperatorAuthService } from 'src/auth/services/operator-auth.service';

import {
  BaseApiErrorResponse,
  SwaggerBaseApiResponse,
} from '../../shared/dtos/base-api-response.dto';
import { AppLogger } from '../../shared/logger/logger.service';
import { ReqContext } from '../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../shared/request-context/request-context.dto';

@ApiTags('Backoffice/Operator Auth')
@ApiBearerAuth()
@Controller('backoffice/auth')
export class OperatorAuthController {
  constructor(
    private readonly operatorAuthService: OperatorAuthService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(OperatorAuthController.name);
  }
  @Post('login')
  @ApiOperation({
    summary: 'Operator login API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(OperatorAuthTokenOutput),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalOperatorAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  login(
    @ReqContext() ctx: RequestContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() credential: OperatorLoginInput,
  ): OperatorAuthTokenOutput {
    this.logger.log(ctx, `${this.login.name} was called`);

    const authToken = this.operatorAuthService.login(ctx);
    return authToken;
  }

  @Post('verify-otp')
  @ApiOperation({
    summary: 'Verify OTP API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(OperatorAuthTokenOutput),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async verifyOtp(
    @ReqContext() ctx: RequestContext,
    @Body() input: OperatorAuthVerityOtpInput,
  ): Promise<OperatorAuthTokenOutput> {
    const res = await this.operatorAuthService.verifyOtp(
      ctx,
      input.email,
      input.otp,
    );
    return res;
  }

  @Post('resend-otp')
  @ApiOperation({
    summary: 'Resend OTP API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.OK)
  async resendOtp(
    @ReqContext() ctx: RequestContext,
    @Body() input: OperatorAuthResendOtpInput,
  ): Promise<void> {
    await this.operatorAuthService.resendOtp(ctx, input.email, input.type);
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Forgot password API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @ReqContext() ctx: RequestContext,
    @Body() input: OperatorForgotPasswordInput,
  ): Promise<void> {
    await this.operatorAuthService.forgotPassword(ctx, input.email);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @ReqContext() ctx: RequestContext,
    @Body() input: OperatorResetPasswordInput,
  ): Promise<void> {
    await this.operatorAuthService.resetPassword(ctx, input);
  }

  @Post('refresh-token')
  @ApiOperation({
    summary: 'Refresh access token API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(OperatorAuthTokenOutput),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtOperatorRefreshGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async refreshToken(
    @ReqContext() ctx: RequestContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() credential: OperatorRefreshTokenInput,
  ): Promise<OperatorAuthTokenOutput> {
    this.logger.log(ctx, `${this.refreshToken.name} was called`);

    const authToken = await this.operatorAuthService.refreshToken(ctx);
    return authToken;
  }

  @Post('change-password')
  @ApiOperation({
    summary: 'Change password API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtOperatorAuthGuard)
  async changePassword(
    @ReqContext() ctx: RequestContext,
    @Body() input: OperatorChangePasswordInput,
  ): Promise<void> {
    await this.operatorAuthService.changePassword(ctx, input);
  }
}
