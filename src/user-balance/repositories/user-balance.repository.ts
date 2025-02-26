import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { UserBalance } from '../entities/user-balance.entity';

@Injectable()
export class UserBalanceRepository extends Repository<UserBalance> {
  constructor(private dataSource: DataSource) {
    super(UserBalance, dataSource.createEntityManager());
  }
}
