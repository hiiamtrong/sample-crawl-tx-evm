import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import {
  UserChangePasswordInput,
  UserChangePasswordOutput,
} from 'src/auth/dtos/user-auth-change-password.dto';
import { UserForgotPasswordOutput } from 'src/auth/dtos/user-auth-forgot-password.dto';
import { UserLoginGoogleInput } from 'src/auth/dtos/user-auth-login-google.dto';
import { UserLoginWeb3Input } from 'src/auth/dtos/user-auth-login-web3.dto';
import { UserRequestVerifyEmailInput, UserVerifyEmailInput } from 'src/auth/dtos/user-auth-request-verify-mail.dto';
import { UserAuthResendOtpOutput } from 'src/auth/dtos/user-auth-resend-otp.dto';
import {
  UserResetPasswordInput,
  UserResetPasswordOutput,
} from 'src/auth/dtos/user-auth-reset-password.dto';
import { FirebaseAuthervice } from 'src/firebase/firebase-auth.service';
import { OtpService } from 'src/otp/otp.service';
import { AppConfigService } from 'src/shared/configs/config.service';
import { AuthProvider, UserStatus } from 'src/user/entities/user.entity';
import { Transactional } from 'typeorm-transactional';

import {
  AppExceptionCode,
  getAppException,
} from '../../shared/exceptions/app.exception';
import { AppLogger } from '../../shared/logger/logger.service';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import { plainToInstanceCustom } from '../../shared/utils/class-transform';
import { UserOutput } from '../../user/dtos/user-output.dto';
import { UserService } from '../../user/services/user.service';
import {
  UserRegisterInput,
  UserRegisterOutput,
} from '../dtos/user-auth-register.dto';
import {
  UserAccessTokenClaims,
  UserAuthTokenOutput,
} from '../dtos/user-auth-token.dto';

@Injectable()
export class UserAuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private config: AppConfigService,
    private readonly logger: AppLogger,
    private readonly otpService: OtpService,
    private readonly firebaseAuthService: FirebaseAuthervice,
  ) {
    this.logger.setContext(UserAuthService.name);
  }

  async validateUser(
    ctx: RequestContext,
    email: string,
    pass: string,
  ): Promise<UserAccessTokenClaims> {
    this.logger.log(ctx, `${this.validateUser.name} was called`);

    const user = await this.userService.validateEmailPassword(ctx, email, pass);

    if (user.firstLogin) {
      await this.userService.updateFirstLogin(ctx, user.id, false);
    }

    if (user.status !== UserStatus.ACTIVE) {
      if (user.status === UserStatus.PENDING) {
        await this.otpService.sendEmailOtp(email, 'verify');
        throw getAppException(AppExceptionCode.USER_NOT_ACTIVE);
      }

      if (user.status === UserStatus.INACTIVE) {
        throw getAppException(AppExceptionCode.USER_IS_INACTIVE);
      }
    }

    return user;
  }

  async login(ctx: RequestContext): Promise<UserAuthTokenOutput> {
    this.logger.log(ctx, `${this.login.name} was called`);
    return this.getAuthToken(ctx, ctx.user);
  }

  async loginGoogle(
    ctx: RequestContext,
    input: UserLoginGoogleInput,
  ): Promise<UserAuthTokenOutput> {
    this.logger.log(ctx, `${this.loginGoogle.name} was called`);
    const { idToken, referralCode } = input;

    const { email, email_verified: emailVerified } =
      await this.firebaseAuthService.verifyIdToken(idToken);

    if (!emailVerified) {
      throw getAppException(AppExceptionCode.USER_EMAIL_NOT_VERIFIED);
    }

    let user = await this.userService.findByEmail(ctx, email);

    if (!user) {
      const password = Math.random().toString(36).slice(2, 10);
      user = await this.userService.createUser(ctx, {
        email,
        password,
        status: UserStatus.ACTIVE,
        referralCode,
        authProvider: AuthProvider.GOOGLE,
        alias: referralCode,
      });
    } else {
      if (user.status === UserStatus.INACTIVE) {
        throw getAppException(AppExceptionCode.USER_NOT_ACTIVE);
      }

      if (user.firstLogin) {
        await this.userService.updateFirstLogin(ctx, user.id, false);
        user.firstLogin = false;
      }
    }

    return this.getAuthToken(ctx, user);
  }

  async loginWeb3(
    ctx: RequestContext,
    input: UserLoginWeb3Input,
  ): Promise<UserAuthTokenOutput> {
    const { address, signature } = input;

    // Verify the signature
    const message = this.config.web3Message;
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      throw getAppException(AppExceptionCode.USER_SIGNATURE_INVALID);
    }

    let user = await this.userService.findByAddress(ctx, address);

    if (!user) {
      // Create user
      const password = Math.random().toString(36).slice(2, 10);
      user = await this.userService.createUser(ctx, {
        address,
        password,
        status: UserStatus.ACTIVE,
        authProvider: AuthProvider.WEB3,
      });
    } else {
      if (user.status === UserStatus.INACTIVE) {
        throw getAppException(AppExceptionCode.USER_NOT_ACTIVE);
      }

      if (user.firstLogin) {
        await this.userService.updateFirstLogin(ctx, user.id, false);
        user.firstLogin = false;
      }
    }


    return this.getAuthToken(ctx, user);
  }

  @Transactional()
  async register(
    ctx: RequestContext,
    input: UserRegisterInput,
  ): Promise<UserRegisterOutput> {
    this.logger.log(ctx, `${this.register.name} was called`);
    const registeredUser = await this.userService.createUser(ctx, {
      ...input,
      authProvider: AuthProvider.BASIC,
    });
    await this.otpService.sendEmailOtp(registeredUser.email, 'verify');

    return plainToInstanceCustom(UserRegisterOutput, registeredUser);
  }

  async verifyOtp(
    ctx: RequestContext,
    email: string,
    otp: string,
  ): Promise<UserAuthTokenOutput> {
    this.logger.log(ctx, `${this.verifyOtp.name} was called`);

    let user = await this.userService.findByEmail(ctx, email);
    if (!user) {
      throw getAppException(AppExceptionCode.USER_NOT_FOUND);
    }

    if (user.status === UserStatus.ACTIVE) {
      throw getAppException(AppExceptionCode.USER_ALREADY_ACTIVE);
    }

    const isOtpValid = await this.otpService.verifyEmailOtp(
      email,
      otp,
      'verify',
    );
    if (!isOtpValid) {
      throw getAppException(AppExceptionCode.USER_OTP_INCORRECT);
    }

    // Update user status to active
    user = await this.userService.updateStatus(ctx, user.id, UserStatus.ACTIVE);

    // Delete the OTP from cache
    await this.otpService.clearEmailOtp(email, 'verify');

    const token = this.getAuthToken(ctx, user);

    return plainToInstanceCustom(UserAuthTokenOutput, token);
  }

  async resendOtp(
    ctx: RequestContext,
    email: string,
    type: 'verify' | 'reset-password',
  ): Promise<UserAuthResendOtpOutput> {
    this.logger.log(ctx, `${this.resendOtp.name} was called`);

    const user = await this.userService.findByEmail(ctx, email);
    if (!user) {
      throw getAppException(AppExceptionCode.USER_NOT_FOUND);
    }

    if (user.status === UserStatus.ACTIVE) {
      throw getAppException(AppExceptionCode.USER_ALREADY_ACTIVE);
    }

    await this.otpService.sendEmailOtp(email, type);

    return plainToInstanceCustom(UserAuthResendOtpOutput, { success: true });
  }

  async refreshToken(ctx: RequestContext): Promise<UserAuthTokenOutput> {
    this.logger.log(ctx, `${this.refreshToken.name} was called`);

    const user = await this.userService.findById(ctx, ctx.user.id);
    if (!user) {
      throw getAppException(AppExceptionCode.USER_NOT_FOUND);
    }

    return this.getAuthToken(ctx, user);
  }

  async forgotPassword(
    ctx: RequestContext,
    email: string,
  ): Promise<UserForgotPasswordOutput> {
    this.logger.log(ctx, `${this.forgotPassword.name} was called`);

    const user = await this.userService.findByEmail(ctx, email);
    if (!user) {
      throw getAppException(AppExceptionCode.USER_NOT_FOUND);
    }

    await this.otpService.sendEmailOtp(email, 'reset-password');

    return plainToInstanceCustom(UserForgotPasswordOutput, { success: true });
  }

  async resetPassword(
    ctx: RequestContext,
    input: UserResetPasswordInput,
  ): Promise<UserResetPasswordOutput> {
    this.logger.log(ctx, `${this.resetPassword.name} was called`);

    const user = await this.userService.findByEmail(ctx, input.email);
    if (!user) {
      throw getAppException(AppExceptionCode.USER_NOT_FOUND);
    }

    const isOtpValid = await this.otpService.verifyEmailOtp(
      input.email,
      input.otp,
      'reset-password',
    );
    if (!isOtpValid) {
      throw getAppException(AppExceptionCode.USER_OTP_INCORRECT);
    }

    await this.userService.updatePassword(ctx, user.id, input.password);
    await this.otpService.clearEmailOtp(input.email, 'reset-password');

    return plainToInstanceCustom(UserResetPasswordOutput, { success: true });
  }

  getAuthToken(
    ctx: RequestContext,
    user: UserAccessTokenClaims | UserOutput,
  ): UserAuthTokenOutput {
    this.logger.log(ctx, `${this.getAuthToken.name} was called`);
    const subject = { sub: user.id };
    const payload = {
      sub: user.id,
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

    return plainToInstanceCustom(UserAuthTokenOutput, {
      ...authToken,
      user,
    });
  }

  async changePassword(
    ctx: RequestContext,
    input: UserChangePasswordInput,
  ): Promise<UserChangePasswordOutput> {
    this.logger.log(ctx, `${this.changePassword.name} was called`);

    const user = await this.userService.findById(ctx, ctx.user.id);
    if (!user) {
      throw getAppException(AppExceptionCode.USER_NOT_FOUND);
    }

    const isPasswordValid = await this.userService.validateEmailPassword(
      ctx,
      user.email,
      input.currentPassword,
    );

    if (!isPasswordValid) {
      throw getAppException(AppExceptionCode.USER_PASSWORD_INCORRECT);
    }

    await this.userService.updatePassword(ctx, user.id, input.newPassword);

    return plainToInstanceCustom(UserChangePasswordOutput, { success: true });
  }

  async requestVerifyEmail(
    ctx: RequestContext,
    input: UserRequestVerifyEmailInput,
  ): Promise<void> {
    const user = await this.userService.findByEmail(ctx, input.email);
    if (user) {
      throw getAppException(AppExceptionCode.USER_EMAIL_ALREADY_EXISTS);
    }

    const currentUser = await this.userService.findById(ctx, ctx.user.id);
    if (currentUser.email) {
      throw getAppException(AppExceptionCode.USER_EMAIL_ALREADY_EXISTS);
    }

    await this.userService.updateTempEmail(ctx, ctx.user.id, input.email);
    await this.otpService.sendEmailOtp(input.email, 'verify-temp-email');
  }

  async verifyEmail(ctx: RequestContext, input: UserVerifyEmailInput): Promise<void> {
    const isOtpValid = await this.otpService.verifyEmailOtp(
      input.email,
      input.otp,
      'verify-temp-email',
    );

    if (!isOtpValid) {
      throw getAppException(AppExceptionCode.USER_OTP_INCORRECT);
    }

    const currentUser = await this.userService.findById(ctx, ctx.user.id);
    if (!currentUser) {
      throw getAppException(AppExceptionCode.USER_NOT_FOUND);
    }

    if (currentUser.email === input.email) {
      throw getAppException(AppExceptionCode.USER_EMAIL_ALREADY_EXISTS);
    }

    if (input.email !== currentUser.tempEmail) {
      throw getAppException(AppExceptionCode.USER_EMAIL_NOT_MATCH);
    }

    await this.userService.updateEmail(ctx, ctx.user.id, input.email);
    await this.otpService.clearEmailOtp(input.email, 'verify-temp-email');
  }
}
