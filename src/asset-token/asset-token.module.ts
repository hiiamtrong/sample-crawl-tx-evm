import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetTokenController } from 'src/asset-token/asset-token.controller';
import { AssetTokenService } from 'src/asset-token/asset-token.service';

import { AssetToken } from './entities/asset-token.entity';
import { AssetTokenRepository } from './repositories/asset-token.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AssetToken])],
  providers: [AssetTokenRepository, AssetTokenService],
  controllers: [AssetTokenController],
  exports: [AssetTokenRepository, AssetTokenService],
})
export class AssetTokenModule {}
