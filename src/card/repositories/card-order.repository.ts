import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { CardOrder } from '../entities/card-order.entity';

@Injectable()
export class CardOrderRepository extends Repository<CardOrder> {
  constructor(private dataSource: DataSource) {
    super(CardOrder, dataSource.createEntityManager());
  }

}
