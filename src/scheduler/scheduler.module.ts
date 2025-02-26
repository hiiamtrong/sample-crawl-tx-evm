import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ScanningSweepTask } from 'src/scheduler/tasks/scanning-sweep.task';
import { SharedModule } from 'src/shared/shared.module';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [
    SharedModule,
    ScheduleModule.forRoot(), TransactionModule],
  controllers: [],
  providers: [ScanningSweepTask],
})
export class SchedulersModule { }
