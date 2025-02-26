import { Module } from '@nestjs/common';

import { TokenPriceService } from './token-price.service';

@Module({
  providers: [TokenPriceService],
  exports: [TokenPriceService],
})
export class TokenPriceModule {}
