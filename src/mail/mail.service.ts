import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QUEUE_SEND_MAIL } from 'src/shared/constants/queue';

import {
  MailData,
  MailDataWithTemplate,
  OperatorResetPasswordData,
  OperatorVerifyEmailData,
  SystemConfigFundHolderAccountRequestData,
  UserResetPasswordData,
  UserVerifyEmailData,
} from './interfaces/mail-data.interface';
import { MAIL_JOB_NAME } from './mail.constant';

export class MailService {
  constructor(
    @InjectQueue(QUEUE_SEND_MAIL)
    private readonly emailQueue: Queue,
  ) {}

  async userVerifyEmail(
    mailData: MailData<UserVerifyEmailData>,
  ): Promise<void> {
    await this.emailQueue.add({
      ...mailData,
      jobName: MAIL_JOB_NAME.verify_email,
    } as MailDataWithTemplate<UserVerifyEmailData>);
  }

  async operatorVerifyEmail(
    mailData: MailData<OperatorVerifyEmailData>,
  ): Promise<void> {
    await this.emailQueue.add({
      ...mailData,
      jobName: MAIL_JOB_NAME.operator_verify_email,
    } as MailDataWithTemplate<OperatorVerifyEmailData>);
  }

  async userResetPassword(
    mailData: MailData<UserResetPasswordData>,
  ): Promise<void> {
    await this.emailQueue.add({
      ...mailData,
      jobName: MAIL_JOB_NAME.user_reset_password,
    } as MailDataWithTemplate<UserResetPasswordData>);
  }

  async operatorResetPassword(
    mailData: MailData<OperatorResetPasswordData>,
  ): Promise<void> {
    await this.emailQueue.add({
      ...mailData,
      jobName: MAIL_JOB_NAME.operator_reset_password,
    } as MailDataWithTemplate<OperatorResetPasswordData>);
  }

  async systemConfigFundHolderAccountRequest(
    mailData: MailData<SystemConfigFundHolderAccountRequestData>,
  ): Promise<void> {
    await this.emailQueue.add({
      ...mailData,
      jobName: MAIL_JOB_NAME.system_config_fund_holder_account_request,
    } as MailDataWithTemplate<SystemConfigFundHolderAccountRequestData>);
  }
}
