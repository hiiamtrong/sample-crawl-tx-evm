//app.module.ts
import * as aws from '@aws-sdk/client-ses';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { AppConfigService } from 'src/shared/configs/config.service';
import { QUEUE_SEND_MAIL } from 'src/shared/constants/queue';

import { MailService } from './mail.service';
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => {
        const emailConfig = config.mail;
        return {
          transport: {
            SES: {
              ses: new aws.SES({
                region: emailConfig.aws.region,
                apiVersion: '2010-12-01',
              }),
              aws,
            },
          },
          defaults: {
            from: `"${emailConfig.defaultName}" <${emailConfig.defaultEmail}>`,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(undefined, {
              inlineCssEnabled: true,
            }),
            options: {
              strict: true,
            },
          },
          options: {},
        };
      },
    }),
    BullModule.registerQueue({
      name: QUEUE_SEND_MAIL,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 10,
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule { }
