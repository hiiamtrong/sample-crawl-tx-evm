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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  UserChangePasswordInput,
  UserChangePasswordOutput,
} from 'src/auth/dtos/user-auth-change-password.dto';
import {
  UserForgotPasswordInput,
  UserForgotPasswordOutput,
} from 'src/auth/dtos/user-auth-forgot-password.dto';
import { UserLoginInput } from 'src/auth/dtos/user-auth-login.dto';
import { UserLoginGoogleInput } from 'src/auth/dtos/user-auth-login-google.dto';
import { UserLoginWeb3Input } from 'src/auth/dtos/user-auth-login-web3.dto';
import { UserRefreshTokenInput } from 'src/auth/dtos/user-auth-refresh-token.dto';
import { UserRequestVerifyEmailInput, UserVerifyEmailInput } from 'src/auth/dtos/user-auth-request-verify-mail.dto';
import {
  UserAuthResendOtpInput,
  UserAuthResendOtpOutput,
} from 'src/auth/dtos/user-auth-resend-otp.dto';
import {
  UserResetPasswordInput,
  UserResetPasswordOutput,
} from 'src/auth/dtos/user-auth-reset-password.dto';
import { UserAuthVerityOtpInput } from 'src/auth/dtos/user-auth-verity-otp.dto';
import { JwtUserAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import {
  BaseApiErrorResponse,
  SwaggerBaseApiResponse,
} from '../../shared/dtos/base-api-response.dto';
import { AppLogger } from '../../shared/logger/logger.service';
import { ReqContext } from '../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import {
  UserRegisterInput,
  UserRegisterOutput,
} from '../dtos/user-auth-register.dto';
import { UserAuthTokenOutput } from '../dtos/user-auth-token.dto';
import { JwtUserRefreshGuard } from '../guards/jwt-refresh.guard';
import { LocalUserAuthGuard } from '../guards/local-auth.guard';
import { UserAuthService } from '../services/user-auth.service';

@ApiTags('User/Auth')
@ApiBearerAuth()
@Controller('auth')
export class UserAuthController {
  constructor(
    private readonly authService: UserAuthService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(UserAuthController.name);
  }
  @Post('login')
  @ApiOperation({
    summary: 'User login API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(UserAuthTokenOutput),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: UserLoginInput })
  @UseGuards(LocalUserAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async login(@ReqContext() ctx: RequestContext): Promise<UserAuthTokenOutput> {
    this.logger.log(ctx, `${this.login.name} was called`);

    const authToken = await this.authService.login(ctx);
    return authToken;
  }

  @Post('login/google')
  @ApiOperation({ operationId: 'user-login-google' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(UserAuthTokenOutput),
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    type: BaseApiErrorResponse,
  })
  loginGoogle(
    @ReqContext() ctx: RequestContext,
    @Body() body: UserLoginGoogleInput,
  ) {
    return this.authService.loginGoogle(ctx, body);
  }

  @Post('login/web3')
  loginWeb3(
    @ReqContext() ctx: RequestContext,
    @Body() body: UserLoginWeb3Input,
  ) {
    return this.authService.loginWeb3(ctx, body);
  }

  @Post('register')
  @ApiOperation({
    summary: 'User registration API',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SwaggerBaseApiResponse(UserRegisterOutput),
  })

  async registerLocal(
    @ReqContext() ctx: RequestContext,
    @Body() input: UserRegisterInput,
  ): Promise<UserRegisterOutput> {
    const registeredUser = await this.authService.register(ctx, input);
    return registeredUser;
  }

  @Post('verify-otp')
  @ApiOperation({
    summary: 'Verify OTP API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(UserAuthTokenOutput),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  async verifyOtp(
    @ReqContext() ctx: RequestContext,
    @Body() input: UserAuthVerityOtpInput,
  ): Promise<UserAuthTokenOutput> {
    const res = await this.authService.verifyOtp(ctx, input.email, input.otp);
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
    @Body() input: UserAuthResendOtpInput,
  ): Promise<UserAuthResendOtpOutput> {
    return this.authService.resendOtp(ctx, input.email, input.type);
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
    @Body() input: UserForgotPasswordInput,
  ): Promise<UserForgotPasswordOutput> {
    return this.authService.forgotPassword(ctx, input.email);
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
    @Body() input: UserResetPasswordInput,
  ): Promise<UserResetPasswordOutput> {
    return this.authService.resetPassword(ctx, input);
  }

  @Post('refresh-token')
  @ApiOperation({
    summary: 'Refresh access token API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(UserAuthTokenOutput),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtUserRefreshGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async refreshToken(
    @ReqContext() ctx: RequestContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() credential: UserRefreshTokenInput,
  ): Promise<UserAuthTokenOutput> {
    this.logger.log(ctx, `${this.refreshToken.name} was called`);

    const authToken = await this.authService.refreshToken(ctx);
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
  @UseGuards(JwtUserAuthGuard)
  async changePassword(
    @ReqContext() ctx: RequestContext,
    @Body() input: UserChangePasswordInput,
  ): Promise<UserChangePasswordOutput> {
    return this.authService.changePassword(ctx, input);
  }

  @ApiOperation({
    summary: 'Request verify email API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BaseApiErrorResponse,
  })
  @UseGuards(JwtUserAuthGuard)
  @Post('request-verify-email')
  async requestVerifyEmail(
    @ReqContext() ctx: RequestContext,
    @Body() input: UserRequestVerifyEmailInput,
  ): Promise<void> {
    return this.authService.requestVerifyEmail(ctx, input);
  }

  @ApiOperation({
    summary: 'Verify email API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: BaseApiErrorResponse,
  })
  @UseGuards(JwtUserAuthGuard)
  @Post('verify-email')
  async verifyEmail(
    @ReqContext() ctx: RequestContext,
    @Body() input: UserVerifyEmailInput,
  ): Promise<void> {
    return this.authService.verifyEmail(ctx, input);
  }
}
