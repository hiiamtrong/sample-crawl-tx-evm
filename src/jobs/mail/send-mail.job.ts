import { InjectQueue } from '@nestjs/bull';
import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bull';
import { Command, CommandRunner } from 'nest-commander';
import { MAIL_JOB_NAME } from 'src/mail/mail.constant';
import { AppConfigService } from 'src/shared/configs/config.service';
import { QUEUE_SEND_MAIL } from 'src/shared/constants/queue';
import { AppLogger } from 'src/shared/logger/logger.service';

import { MailExecutorService } from './mail-executor.service';

@Command({
  name: 'job:send-mail',
  description: 'Execute send mail jobs',
})
export class SendMailJob
  extends CommandRunner
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @InjectQueue(QUEUE_SEND_MAIL)
    private readonly queue: Queue,
    private readonly mailExecutorService: MailExecutorService,
    private readonly config: AppConfigService,
    private readonly logger: AppLogger,
  ) {
    super();
    this.logger.setContext(SendMailJob.name);
  }

  async onModuleInit() {
    this.queue.on('active', (job) => {
      this.logger.log(null, `Starting job ${job?.id}`);
    });
    this.queue.on('completed', (job) => {
      this.logger.log(null, `Job ${job?.id} has been completed`);
    });
    this.queue.on('failed', (job, error) => {
      this.logger.error(null, `Job ${job?.id} failed`);
      this.logger.error(null, `Error: ${error}`, { job });
      this.logger.error(null, 'data___', job.data);
    });
  }

  onModuleDestroy() {
    this.queue.removeAllListeners();
  }

  async run(): Promise<void> {
    const concurrency = this.config.mail.concurrency;
    await this.queue.process(+concurrency, async (job) => {
      switch (job.data.jobName) {
        case MAIL_JOB_NAME.verify_email:
          return this.mailExecutorService.verifyEmail(job.data);
        case MAIL_JOB_NAME.operator_verify_email:
          return this.mailExecutorService.operatorVerifyEmail(job.data);
        case MAIL_JOB_NAME.user_reset_password:
          return this.mailExecutorService.userResetPassword(job.data);
        case MAIL_JOB_NAME.operator_reset_password:
          return this.mailExecutorService.operatorResetPassword(job.data);
        case MAIL_JOB_NAME.system_config_fund_holder_account_request:
          return this.mailExecutorService.systemConfigFundHolderAccountRequest(job.data);
        default:
          this.logger.log(null, 'Email job name not found', job.data.jobName);
          return {};
      }
    });
    return new Promise(() => {});
  }
}
