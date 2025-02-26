import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { FireblocksVault } from '../entities/fireblocks-vault.entity';

@Injectable()
export class FireblocksVaultRepository extends Repository<FireblocksVault> {
  constructor(private dataSource: DataSource) {
    super(FireblocksVault, dataSource.createEntityManager());
  }

}
