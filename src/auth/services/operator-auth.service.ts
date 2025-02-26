import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OperatorChangePasswordInput } from 'src/auth/dtos/operator-auth-change-password.dto';
import { OperatorForgotPasswordOutput } from 'src/auth/dtos/operator-auth-forgot-password.dto';
import { OperatorAuthResendOtpOutput } from 'src/auth/dtos/operator-auth-resend-otp.dto';
import { OperatorResetPasswordInput } from 'src/auth/dtos/operator-auth-reset-password.dto';
import {
  OperatorAccessTokenClaims,
  OperatorAuthTokenOutput,
} from 'src/auth/dtos/operator-auth-token.dto';
import { OperatorOutput } from 'src/operator/dtos/operator.dto';
import { OperatorStatus } from 'src/operator/entities/operator.entity';
import { OperatorService } from 'src/operator/operator.service';
import { OtpService } from 'src/otp/otp.service';
import { AppConfigService } from 'src/shared/configs/config.service';

import {
  AppExceptionCode,
  getAppException,
} from '../../shared/exceptions/app.exception';
import { AppLogger } from '../../shared/logger/logger.service';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import { plainToInstanceCustom } from '../../shared/utils/class-transform';

@Injectable()
export class OperatorAuthService {
  constructor(
    private operatorService: OperatorService,
    private jwtService: JwtService,
    private config: AppConfigService,
    private readonly logger: AppLogger,
    private readonly otpService: OtpService,
  ) {
    this.logger.setContext(OperatorAuthService.name);
  }

  async validateOperator(
    ctx: RequestContext,
    email: string,
    pass: string,
  ): Promise<OperatorAccessTokenClaims> {
    this.logger.log(ctx, `${this.validateOperator.name} was called`);

    const operator = await this.operatorService.validateEmailPassword(
      ctx,
      email,
      pass,
    );

    // Prevent disabled users from logging in.
    if (operator.status !== OperatorStatus.ACTIVE) {
      throw getAppException(AppExceptionCode.OPERATOR_NOT_ACTIVE);
    }

    return operator;
  }

  login(ctx: RequestContext): OperatorAuthTokenOutput {
    this.logger.log(ctx, `${this.login.name} was called`);

    return this.getAuthToken(ctx, ctx.user);
  }

  async verifyOtp(
    ctx: RequestContext,
    email: string,
    otp: string,
  ): Promise<OperatorAuthTokenOutput> {
    this.logger.log(ctx, `${this.verifyOtp.name} was called`);

    let operator = await this.operatorService.findByEmail(ctx, email);
    if (!operator) {
      throw getAppException(AppExceptionCode.OPERATOR_NOT_FOUND);
    }

    if (operator.status === OperatorStatus.ACTIVE) {
      throw getAppException(AppExceptionCode.OPERATOR_ALREADY_ACTIVE);
    }

    const isOtpValid = await this.otpService.verifyEmailOtp(
      email,
      otp,
      'operator-verify',
    );
    if (!isOtpValid) {
      throw getAppException(AppExceptionCode.OPERATOR_OTP_INCORRECT);
    }

    operator = await this.operatorService.updateStatus(
      ctx,
      operator.id,
      OperatorStatus.ACTIVE,
    );

    // Delete the OTP from cache
    await this.otpService.clearEmailOtp(email, 'operator-verify');

    const token = this.getAuthToken(ctx, operator);

    return plainToInstanceCustom(OperatorAuthTokenOutput, token);
  }

  async resendOtp(
    ctx: RequestContext,
    email: string,
    type: 'verify' | 'reset-password',
  ): Promise<OperatorAuthResendOtpOutput> {
    this.logger.log(ctx, `${this.resendOtp.name} was called`);

    const operator = await this.operatorService.findByEmail(ctx, email);
    if (!operator) {
      throw getAppException(AppExceptionCode.OPERATOR_NOT_FOUND);
    }

    if (operator.status === OperatorStatus.ACTIVE) {
      throw getAppException(AppExceptionCode.OPERATOR_ALREADY_ACTIVE);
    }

    await this.otpService.sendEmailOtp(email, type);

    return { success: true };
  }

  async refreshToken(ctx: RequestContext): Promise<OperatorAuthTokenOutput> {
    this.logger.log(ctx, `${this.refreshToken.name} was called`);

    const user = await this.operatorService.findById(ctx, ctx.user.id);
    if (!user) {
      throw getAppException(AppExceptionCode.OPERATOR_NOT_FOUND);
    }

    return this.getAuthToken(ctx, user);
  }

  async forgotPassword(
    ctx: RequestContext,
    email: string,
  ): Promise<OperatorForgotPasswordOutput> {
    this.logger.log(ctx, `${this.forgotPassword.name} was called`);

    const operator = await this.operatorService.findByEmail(ctx, email);
    if (!operator) {
      throw getAppException(AppExceptionCode.OPERATOR_NOT_FOUND);
    }

    await this.otpService.sendEmailOtp(email, 'operator-reset-password');

    return { success: true };
  }

  async resetPassword(
    ctx: RequestContext,
    input: OperatorResetPasswordInput,
  ): Promise<void> {
    this.logger.log(ctx, `${this.resetPassword.name} was called`);

    const operator = await this.operatorService.findByEmail(ctx, input.email);
    if (!operator) {
      throw getAppException(AppExceptionCode.OPERATOR_NOT_FOUND);
    }

    const isOtpValid = await this.otpService.verifyEmailOtp(
      input.email,
      input.otp,
      'operator-reset-password',
    );
    if (!isOtpValid) {
      throw getAppException(AppExceptionCode.OPERATOR_OTP_INCORRECT);
    }

    await this.operatorService.updatePassword(ctx, operator.id, input.password);
    await this.otpService.clearEmailOtp(input.email, 'operator-reset-password');
  }

  async changePassword(
    ctx: RequestContext,
    input: OperatorChangePasswordInput,
  ): Promise<void> {
    this.logger.log(ctx, `${this.changePassword.name} was called`);

    const operator = await this.operatorService.findById(ctx, ctx.user.id);
    if (!operator) {
      throw getAppException(AppExceptionCode.OPERATOR_NOT_FOUND);
    }

    const isPasswordValid = await this.operatorService.validateEmailPassword(
      ctx,
      operator.email,
      input.currentPassword,
    );

    if (!isPasswordValid) {
      throw getAppException(AppExceptionCode.OPERATOR_PASSWORD_INCORRECT);
    }

    await this.operatorService.updatePassword(
      ctx,
      operator.id,
      input.newPassword,
    );
  }

  getAuthToken(
    ctx: RequestContext,
    operator: OperatorAccessTokenClaims | OperatorOutput,
  ): OperatorAuthTokenOutput {
    this.logger.log(ctx, `${this.getAuthToken.name} was called`);

    const subject = { sub: operator.id };
    const payload = {
      sub: operator.id,
    };

    const authToken = {
      refreshToken: this.jwtService.sign(subject, {
        expiresIn: this.config.jwt.refreshTokenExpInSec,
      }),
      accessToken: this.jwtService.sign(
        { ...payload, ...subject },
        { expiresIn: this.config.jwt.accessTokenExpInSec },
      ),
    };
    return plainToInstanceCustom(OperatorAuthTokenOutput, authToken);
  }
}
