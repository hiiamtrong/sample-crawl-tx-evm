import { Injectable, Scope } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { RequestContext } from "src/shared/request-context/request-context.dto";
import { TransactionService } from "src/transaction/services/transaction.service";
import { v4 as uuidv4 } from 'uuid';
@Injectable({ scope: Scope.DEFAULT })
export class ScanningSweepTask {
  constructor(private readonly transactionService: TransactionService) { }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const ctx = new RequestContext({
      requestID: uuidv4(),
    });
    await this.transactionService.scanSweep(ctx);
  }
}
