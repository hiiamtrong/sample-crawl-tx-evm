import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { FireblocksInternalAsset } from '../entities/fireblocks-internal-asset.entity';

@Injectable()
export class FireblocksInternalAssetRepository extends Repository<FireblocksInternalAsset> {
  constructor(private dataSource: DataSource) {
    super(FireblocksInternalAsset, dataSource.createEntityManager());
  }
}
