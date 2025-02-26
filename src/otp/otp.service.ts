import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { OtpType } from 'src/auth/constants/otp.constant';
import { MailService } from 'src/mail/mail.service';
import { AppConfigService } from 'src/shared/configs/config.service';
import {
  CACHE_KEY_EMAIL_OTP,
  CACHE_KEY_PHONE_OTP,
} from 'src/shared/constants/cache';
import { CacheUtils } from 'src/shared/utils/cache';

@Injectable()
export class OtpService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly config: AppConfigService,
    private readonly mailService: MailService,
  ) { }

  generateOtp(): string {
    const digits = '0123456789';
    let otp = '';
    const len = digits.length;
    for (let i = 0; i < this.config.otp.length; i++) {
      otp += digits[Math.floor(Math.random() * len)];
    }

    return otp;
  }

  async sendPhoneOtp(phone: string): Promise<void> {
    const otp = this.generateOtp();
    // Todo: Send OTP to the phone number
    await this.cacheManager.set(
      CacheUtils.getCacheKey(CACHE_KEY_PHONE_OTP, phone),
      otp,
      this.config.otp.ttl,
    );
  }

  async verifyPhoneOtp(phone: string, otp: string): Promise<boolean> {
    const cachedOtp = await this.cacheManager.get<string>(
      CacheUtils.getCacheKey(CACHE_KEY_PHONE_OTP, phone),
    );
    return cachedOtp === otp;
  }

  async clearPhoneOtp(phone: string): Promise<void> {
    await this.cacheManager.del(
      CacheUtils.getCacheKey(CACHE_KEY_PHONE_OTP, phone),
    );
  }

  async sendEmailOtp(email: string, type: OtpType, payload?: any) {
    const otp = this.generateOtp();

    await this.cacheManager.set(
      CacheUtils.getCacheKey(CACHE_KEY_EMAIL_OTP(type), email),
      otp,
      this.config.otp.ttl,
    );

    // Milliseconds

    const otpExpiresIn = this.config.otp.ttl / 10000;
    switch (type) {
      case 'verify':
        await this.mailService.userVerifyEmail({
          to: email,
          data: {
            otp,
            otpExpiresIn: `${otpExpiresIn}s`,
            redirectUrl: `${this.config.app.frontendUrl}/verify?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`
          }
        });
        break;
      case 'verify-temp-email':
        await this.mailService.userVerifyEmail({
          to: email,
          data: {
            otp,
            otpExpiresIn: `${otpExpiresIn}s`,
            redirectUrl: `${this.config.app.frontendUrl}/verify-email?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`
          },
        });
        break;
      case 'operator-verify':
        await this.mailService.operatorVerifyEmail({
          to: email,
          data: {
            otp,
            otpExpiresIn: `${otpExpiresIn}s`,
            redirectUrl: `${this.config.app.adminUrl}/verify?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`
          },
        });
        break;
      case 'reset-password':
        await this.mailService.userResetPassword({
          to: email,
          data: {
            otp,
            otpExpiresIn: `${otpExpiresIn}s`,
            redirectUrl: `${this.config.app.frontendUrl}/reset-password`
          },
        });
        break;
      case 'operator-reset-password':
        await this.mailService.operatorResetPassword({
          to: email,
          data: {
            otp,
            otpExpiresIn: `${otpExpiresIn}s`,
            redirectUrl: `${this.config.app.adminUrl}/reset-password`
          },
        });
        break;
      case 'system-config-fund-holder-account-request':
        const { network } = payload;
        await this.mailService.systemConfigFundHolderAccountRequest({
          to: email,
          data: {
            network,
            otp,
            otpExpiresIn: `${otpExpiresIn}s`,
          },
        });
        break;
    }
  }

  async verifyEmailOtp(
    email: string,
    otp: string,
    type: OtpType,
  ): Promise<boolean> {
    const cachedOtp = await this.cacheManager.get<string>(
      CacheUtils.getCacheKey(CACHE_KEY_EMAIL_OTP(type), email),
    );
    return cachedOtp === otp;
  }

  async clearEmailOtp(email: string, type: OtpType): Promise<void> {
    await this.cacheManager.del(
      CacheUtils.getCacheKey(CACHE_KEY_EMAIL_OTP(type), email),
    );
  }
}
