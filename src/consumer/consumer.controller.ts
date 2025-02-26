import { Controller, Injectable } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';
import { ConsumerService } from 'src/consumer/consumer.service';
import { DepositEvent } from 'src/crawler/models/deposit-event.model';
import { FIREBLOCKS_EVENT_PATTERNS, FireblocksSweepMessage,FireblocksWebhookTransaction } from 'src/fireblocks/fireblocks.constant';
import { FireblocksService } from 'src/fireblocks/services/fireblocks.service';
import {
  DEPOSIT_CRAWLER_DEAD_LETTER_EVENT,
  DEPOSIT_CRAWLER_EVENT,
  SCAN_SEND_FEE_EVENT,
  SCAN_SEND_FEE_EVENT_DEAD_LETTER,
  SCAN_SWEEP_EVENT,
  SCAN_SWEEP_EVENT_DEAD_LETTER,
  SCAN_WITHDRAW_EVENT,
  SCAN_WITHDRAW_EVENT_DEAD_LETTER,
  SWEEP_EVENT,
  WITHDRAW_EVENT,
} from 'src/shared/constants/crawler';
import { DeadLetterMessage } from 'src/shared/constants/queue';
import { ReqContext } from 'src/shared/request-context/req-context.decorator';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { AssetTransaction } from 'src/transaction/entities/asset-transaction.entity';
import { TransactionService } from 'src/transaction/services/transaction.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
@Controller('consumer')
export class ConsumerController {
  constructor(private readonly consumerService: ConsumerService, private readonly transactionService: TransactionService, private readonly fireblocksService: FireblocksService) { }

  @EventPattern(DEPOSIT_CRAWLER_EVENT)
  async handleDeposit(
    @Payload() message: DepositEvent,
    @Ctx() context: KafkaContext,
  ) {
    const reqCtx = new RequestContext({
      requestID: uuidv4(),
    });
    await this.consumerService.handleDeposit(context, reqCtx, message);

    const { offset } = context.getMessage();
    const partition = context.getPartition();
    const topic = context.getTopic();
    const consumer = context.getConsumer();
    await consumer.commitOffsets([{ topic, partition, offset }]);
  }

  @EventPattern(DEPOSIT_CRAWLER_DEAD_LETTER_EVENT)
  async handleDepositDeadLetter(
    @Payload() message: DeadLetterMessage<DepositEvent>,
    @Ctx() context: KafkaContext,
  ) {
    const reqCtx = new RequestContext({
      requestID: uuidv4(),
    });
    try {
      await this.consumerService.handleDepositDeadLetter(
        context,
        reqCtx,
        message,
      );
    } catch (e) {
      message.deadLetterReason = e.message;
      message.retryCount = message.retryCount + 1 || 1;
      await this.consumerService.handleNewDepositDeadLetter(
        context,
        reqCtx,
        message,
      );
    }
    const { offset } = context.getMessage();
    const partition = context.getPartition();
    const topic = context.getTopic();
    const consumer = context.getConsumer();
    await consumer.commitOffsets([{ topic, partition, offset }]);
  }


  @EventPattern(WITHDRAW_EVENT)
  async handleWithdrawEvent(
    @Payload() message: AssetTransaction,
    @Ctx() context: KafkaContext,
  ) {
    const reqCtx = new RequestContext({
      requestID: uuidv4(),
    });
    await this.transactionService.handleWithdrawEvent(context, reqCtx, message);

    const { offset } = context.getMessage();
    const partition = context.getPartition();
    const topic = context.getTopic();
    const consumer = context.getConsumer();
    await consumer.commitOffsets([{ topic, partition, offset }]);
  }

  @EventPattern(SCAN_WITHDRAW_EVENT)
  async handleScanWithdrawEvent(
    @Payload() message: AssetTransaction,
    @Ctx() context: KafkaContext,
  ) {
    const reqCtx = new RequestContext({
      requestID: uuidv4(),
    });

    try {
      await this.transactionService.handleScanWithdrawEvent(
        context,
        reqCtx,
        message,
      );
    } catch (error) {
      const deadLetterMessage = new DeadLetterMessage<AssetTransaction>();
      deadLetterMessage.retryCount = 1;
      deadLetterMessage.deadLetterReason = error.message;
      deadLetterMessage.message = message;

      await this.transactionService.handleNewWithdrawDeadLetter(
        context,
        reqCtx,
        deadLetterMessage,
      );
    }

    const { offset } = context.getMessage();
    const partition = context.getPartition();
    const topic = context.getTopic();
    const consumer = context.getConsumer();
    await consumer.commitOffsets([{ topic, partition, offset }]);
  }

  @EventPattern(SCAN_WITHDRAW_EVENT_DEAD_LETTER)
  async handleScanWithdrawDeadLetter(
    @Payload() message: DeadLetterMessage<AssetTransaction>,
    @Ctx() context: KafkaContext,
  ) {
    const reqCtx = new RequestContext({
      requestID: uuidv4(),
    });
    try {
      await this.transactionService.handleScanWithdrawDeadLetter(
        context,
        reqCtx,
        message,
      );
    } catch (error) {
      message.retryCount = message.retryCount + 1 || 1;
      message.deadLetterReason = error.message;
      await this.transactionService.handleNewWithdrawDeadLetter(
        context,
        reqCtx,
        message,
      );
    }

    const { offset } = context.getMessage();
    const partition = context.getPartition();
    const topic = context.getTopic();
    const consumer = context.getConsumer();
    await consumer.commitOffsets([{ topic, partition, offset }]);
  }

  @EventPattern(SWEEP_EVENT)
  async handleSweepEvent(
    @Payload() message: AssetTransaction,
    @Ctx() context: KafkaContext,
  ) {
    const reqCtx = new RequestContext({
      requestID: uuidv4(),
    });
    await this.transactionService.handleSweepEvent(context, reqCtx, message);

    const { offset } = context.getMessage();
    const partition = context.getPartition();
    const topic = context.getTopic();
    const consumer = context.getConsumer();
    await consumer.commitOffsets([{ topic, partition, offset }]);
  }

  @EventPattern(SCAN_SWEEP_EVENT_DEAD_LETTER)
  async handleScanSweepDeadLetter(
    @Payload() message: DeadLetterMessage<AssetTransaction>,
    @Ctx() context: KafkaContext,
  ) {
    const reqCtx = new RequestContext({
      requestID: uuidv4(),
    });
    try {
      await this.transactionService.handleScanSweepDeadLetter(context, reqCtx, message);
    } catch (error) {
      message.retryCount = message.retryCount + 1 || 1;
      message.deadLetterReason = error.message;
      await this.transactionService.handleNewScanSweepDeadLetter(context, reqCtx, message);
    }

    const { offset } = context.getMessage();
    const partition = context.getPartition();
    const topic = context.getTopic();
    const consumer = context.getConsumer();
    await consumer.commitOffsets([{ topic, partition, offset }]);
  }

  @EventPattern(SCAN_SWEEP_EVENT)
  async handleScanSweepEvent(
    @Payload() message: AssetTransaction,
    @Ctx() context: KafkaContext,
  ) {
    const reqCtx = new RequestContext({
      requestID: uuidv4(),
    });
    try {
      await this.transactionService.handleScanSweepEvent(context, reqCtx, message);
    } catch (error) {
      const deadLetterMessage = new DeadLetterMessage<AssetTransaction>();
      deadLetterMessage.retryCount = 1;
      deadLetterMessage.deadLetterReason = error.message;
      deadLetterMessage.message = message;
      await this.transactionService.handleNewScanSweepDeadLetter(context, reqCtx, deadLetterMessage);
    }

    const { offset } = context.getMessage();
    const partition = context.getPartition();
    const topic = context.getTopic();
    const consumer = context.getConsumer();
    await consumer.commitOffsets([{ topic, partition, offset }]);
  }

  @EventPattern(SCAN_SEND_FEE_EVENT)
  async handleScanSendFeeEvent(
    @Payload() message: AssetTransaction,
    @Ctx() context: KafkaContext,
  ) {
    const reqCtx = new RequestContext({
      requestID: uuidv4(),
    });
    try {
      await this.transactionService.handleScanSendFeeEvent(context, reqCtx, message);
    } catch (error) {
      const deadLetterMessage = new DeadLetterMessage<AssetTransaction>();
      deadLetterMessage.retryCount = 1;
      deadLetterMessage.deadLetterReason = error.message;
      deadLetterMessage.message = message;
      await this.transactionService.handleNewScanSendFeeDeadLetter(context, reqCtx, deadLetterMessage);
    }

    const { offset } = context.getMessage();
    const partition = context.getPartition();
    const topic = context.getTopic();
    const consumer = context.getConsumer();
    await consumer.commitOffsets([{ topic, partition, offset }]);
  }

  @EventPattern(SCAN_SEND_FEE_EVENT_DEAD_LETTER)
  async handleScanSendFeeDeadLetter(
    @Payload() message: DeadLetterMessage<AssetTransaction>,
    @Ctx() context: KafkaContext,
  ) {
    const reqCtx = new RequestContext({
      requestID: uuidv4(),
    });
    try {
      await this.transactionService.handleScanSendFeeDeadLetter(context, reqCtx, message);
    } catch (error) {
      message.retryCount = message.retryCount + 1 || 1;
      message.deadLetterReason = error.message;
      await this.transactionService.handleNewScanSendFeeDeadLetter(context, reqCtx, message);
    }

    const { offset } = context.getMessage();
    const partition = context.getPartition();
    const topic = context.getTopic();
    const consumer = context.getConsumer();
    await consumer.commitOffsets([{ topic, partition, offset }]);
  }

  @EventPattern(FIREBLOCKS_EVENT_PATTERNS.WEBHOOK_TRANSACTION)
  async handleWebhookTransaction(
    @ReqContext() ctx: RequestContext,
    @Payload() message: FireblocksWebhookTransaction,
    @Ctx() kafkaCtx: KafkaContext,
  ) {
    await this.fireblocksService.handleWebhook(ctx, kafkaCtx, message);
    const { offset } = kafkaCtx.getMessage();
    const partition = kafkaCtx.getPartition();
    const topic = kafkaCtx.getTopic();
    const consumer = kafkaCtx.getConsumer();
    await consumer.commitOffsets([{ topic, partition, offset }]);
  }

  @EventPattern(FIREBLOCKS_EVENT_PATTERNS.SWEEP_TRANSACTION)
  async handleSweepTransaction(
    @ReqContext() ctx: RequestContext,
    @Payload() message: FireblocksSweepMessage,
    @Ctx() kafkaCtx: KafkaContext,
  ) {
    await this.fireblocksService.handleSweepTransaction(ctx, kafkaCtx, message);
    const { offset } = kafkaCtx.getMessage();
    const partition = kafkaCtx.getPartition();
    const topic = kafkaCtx.getTopic();
    const consumer = kafkaCtx.getConsumer();
    await consumer.commitOffsets([{ topic, partition, offset }]);
  }
}
