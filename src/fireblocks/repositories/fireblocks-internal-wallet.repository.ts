import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { FireblocksInternalWallet } from '../entities/fireblocks-internal-wallet.entity';

@Injectable()
export class FireblocksInternalWalletRepository extends Repository<FireblocksInternalWallet> {
  constructor(private dataSource: DataSource) {
    super(FireblocksInternalWallet, dataSource.createEntityManager());
  }
}
