import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MailModule } from 'src/mail/mail.module';
import { QUEUE_SEND_MAIL } from 'src/shared/constants/queue';
import { SharedModule } from 'src/shared/shared.module';

import { MailExecutorService } from './mail/mail-executor.service';
import { SendMailJob } from './mail/send-mail.job';

@Module({
  imports: [
    SharedModule,
    MailModule,
    BullModule.registerQueue({
      name: QUEUE_SEND_MAIL,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 10,
      },
    }),
  ],
  providers: [MailExecutorService, SendMailJob],
})
export class JobModule { }
