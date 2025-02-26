import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QueuePrefixKey } from 'src/queue/queue.constant';
import { AppConfigService } from 'src/shared/configs/config.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService: AppConfigService) => {
        const config = configService.redis;
        return {
          redis: {
            host: config.host,
            port: config.port,
            password: config.pass,
          },
          prefix: QueuePrefixKey,
        };
      },
      inject: [AppConfigService],
    }),
  ],
})
export class QueueModule {}
