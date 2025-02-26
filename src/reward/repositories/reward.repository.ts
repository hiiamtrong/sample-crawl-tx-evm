import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Reward } from '../entities/reward.entity';

@Injectable()
export class RewardRepository extends Repository<Reward> {
  constructor(private dataSource: DataSource) {
    super(Reward, dataSource.createEntityManager());
  }

}
