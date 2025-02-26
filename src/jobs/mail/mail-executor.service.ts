import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import {
  MailData,
  OperatorResetPasswordData,
  OperatorVerifyEmailData,
  SystemConfigFundHolderAccountRequestData,
  UserResetPasswordData,
  UserVerifyEmailData,
} from 'src/mail/interfaces/mail-data.interface';

@Injectable()
export class MailExecutorService {
  constructor(private readonly mailerService: MailerService) { }

  async verifyEmail(data: MailData<UserVerifyEmailData>) {
    await this.mailerService.sendMail({
      to: data.to,
      subject: 'Verify email',
      template: 'verify-email.hbs',
      context: data.data,
    });
  }


  async operatorVerifyEmail(data: MailData<OperatorVerifyEmailData>) {
    await this.mailerService.sendMail({
      to: data.to,
      subject: 'Verify email',
      template: 'verify-email.hbs',
      context: data.data,
    });
  }

  async userResetPassword(data: MailData<UserResetPasswordData>) {
    if (data.data.redirectUrl) {
      const url = new URL(data.data.redirectUrl);
      url.searchParams.append('email', data.to);
      url.searchParams.append('otp', data.data.otp);
      data.data.redirectUrl = url.toString();
    }
    await this.mailerService.sendMail({
      to: data.to,
      subject: 'Reset password',
      template: 'user-reset-password.hbs',
      context: data.data,
    });
  }

  async operatorResetPassword(data: MailData<OperatorResetPasswordData>) {
    if (data.data.redirectUrl) {
      const url = new URL(data.data.redirectUrl);
      url.searchParams.append('email', data.to);
      url.searchParams.append('otp', data.data.otp);
      data.data.redirectUrl = url.toString();
    }
    await this.mailerService.sendMail({
      to: data.to,
      subject: 'Reset password',
      template: 'operator-reset-password.hbs',
      context: data.data,
    });
  }

  async systemConfigFundHolderAccountRequest(
    data: MailData<SystemConfigFundHolderAccountRequestData>,
  ) {
    await this.mailerService.sendMail({
      to: data.to,
      subject: 'Fund Holder Account Request',
      template: 'system-config-fund-holder-account-request.hbs',
      context: data.data,
    });
  }
}
