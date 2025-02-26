import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { UserReferral } from '../entities/user-referral.entity';

@Injectable()
export class UserReferralRepository extends Repository<UserReferral> {
  constructor(private dataSource: DataSource) {
    super(UserReferral, dataSource.createEntityManager());
  }

}
