import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperatorModule } from 'src/operator/operator.module';
import { OtpModule } from 'src/otp/otp.module';
import { SystemConfigController } from 'src/system-config/controllers/system-config.controller';

import { BackofficeSystemConfigController } from './controllers/backoffice-system-config.controller';
import { SystemConfig } from './entities/system-config.entity';
import { SystemConfigService } from './services/system-config.service';

@Module({
  imports: [TypeOrmModule.forFeature([SystemConfig]), OtpModule, OperatorModule],
  providers: [SystemConfigService],
  controllers: [BackofficeSystemConfigController, SystemConfigController],
  exports: [SystemConfigService],
})
export class SystemConfigModule { }
