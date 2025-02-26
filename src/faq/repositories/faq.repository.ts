import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { FAQ } from '../entities/faq.entity';

@Injectable()
export class FAQRepository extends Repository<FAQ> {
  constructor(private dataSource: DataSource) {
    super(FAQ, dataSource.createEntityManager());
  }

}
