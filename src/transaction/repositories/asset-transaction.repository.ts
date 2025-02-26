import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { AssetTransaction } from '../entities/asset-transaction.entity';

@Injectable()
export class AssetTransactionRepository extends Repository<AssetTransaction> {
  constructor(private dataSource: DataSource) {
    super(AssetTransaction, dataSource.createEntityManager());
  }
}
