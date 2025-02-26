import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { FireblocksWebhookTransaction } from '../entities/fireblocks-webhook-transaction.entity';

@Injectable()
export class FireblocksWebhookTransactionRepository extends Repository<FireblocksWebhookTransaction> {
  constructor(private dataSource: DataSource) {
    super(FireblocksWebhookTransaction, dataSource.createEntityManager());
  }


}
