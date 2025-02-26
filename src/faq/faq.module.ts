import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackofficeFAQController } from 'src/faq/controllers/backoffice-faq.controller';
import { BackofficeFAQService } from 'src/faq/services/backoffice-faq.service';

import { FAQ } from './entities/faq.entity';
import { FAQRepository } from './repositories/faq.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FAQ])],
  providers: [FAQRepository, BackofficeFAQService],
  controllers: [BackofficeFAQController],
  exports: [FAQRepository, BackofficeFAQService],
})
export class FAQModule {}
