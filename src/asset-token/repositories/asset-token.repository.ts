import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { AssetToken } from '../entities/asset-token.entity';

@Injectable()
export class AssetTokenRepository extends Repository<AssetToken> {
  constructor(private dataSource: DataSource) {
    super(AssetToken, dataSource.createEntityManager());
  }

}
