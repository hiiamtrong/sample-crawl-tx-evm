import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { CardUser } from '../entities/card-user.entity';

@Injectable()
export class CardUserRepository extends Repository<CardUser> {
  constructor(private dataSource: DataSource) {
    super(CardUser, dataSource.createEntityManager());
  }
}
