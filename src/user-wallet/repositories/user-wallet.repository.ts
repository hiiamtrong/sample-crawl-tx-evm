import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { UserWallet } from '../entities/user-wallet.entity';

@Injectable()
export class UserWalletRepository extends Repository<UserWallet> {
  constructor(private dataSource: DataSource) {
    super(UserWallet, dataSource.createEntityManager());
  }

}
