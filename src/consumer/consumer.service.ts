import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, KafkaContext } from '@nestjs/microservices';
import BigNumber from 'bignumber.js';
import { AssetTokenRepository } from 'src/asset-token/repositories/asset-token.repository';
import { DepositEvent } from 'src/crawler/models/deposit-event.model';
import { RewardService } from 'src/reward/services/reward.service';
import { AppConfigService } from 'src/shared/configs/config.service';
import {
  BLOCKCHAIN_MICROSERVICE,
  DEPOSIT_CRAWLER_DEAD_LETTER_EVENT,
} from 'src/shared/constants/crawler';
import { DeadLetterMessage } from 'src/shared/constants/queue';
import { AppLogger } from 'src/shared/logger/logger.service';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { SystemConfigService } from 'src/system-config/services/system-config.service';
import { TelegramBotService } from 'src/telegrambot/telegram-bot.service';
import { TokenPriceService } from 'src/token-price/token-price.service';
import {
  AssetTransactionStatusEnum,
  AssetTransactionTypeEnum
} from 'src/transaction/entities/asset-transaction.entity';
import { AssetTransactionRepository } from 'src/transaction/repositories/asset-transaction.repository';
import { UserBalanceService } from 'src/user-balance/services/user-balance.service';
import { UserReferralRepository } from 'src/user-referral/repositories/user-referral.repository';
import { UserReferralService } from 'src/user-referral/user-referral.service';
import { UserWalletRepository } from 'src/user-wallet/repositories/user-wallet.repository';
import { UserWalletService } from 'src/user-wallet/user-wallet.service';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class ConsumerService {
  constructor(
    private readonly logger: AppLogger,
    @Inject(BLOCKCHAIN_MICROSERVICE)
    private readonly depositCrawlerMicroservice: ClientProxy,
    private readonly assetTransactionRepository: AssetTransactionRepository,
    private readonly assetTokenRepository: AssetTokenRepository,
    private readonly userWalletRepository: UserWalletRepository,
    private readonly userBalanceService: UserBalanceService,
    private readonly tokenPriceService: TokenPriceService,
    private readonly userReferralRepository: UserReferralRepository,
    private readonly rewardService: RewardService,
    private readonly systemConfigService: SystemConfigService,
    private readonly userReferralService: UserReferralService,
    private readonly userWalletService: UserWalletService,
    private readonly telegramBotService: TelegramBotService,
    private readonly config: AppConfigService,
  ) {
    logger.setContext(ConsumerService.name);
  }

  @Transactional()
  async handleDeposit(
    _: KafkaContext,
    reqCtx: RequestContext,
    message: DepositEvent,
  ) {
    const {
      txHash,
      from,
      to,
      amount,
      contractAddress,
      chainId,
      fee,
      blockNumber,
    } = message;

    this.logger.log(
      reqCtx,
      `Consumer block number: ${blockNumber} of chainId: ${chainId} for contractAddress: ${contractAddress}`,
    );
    const assetToken = await this.assetTokenRepository
      .findOne({
        where: {
          contractAddress,
          chainId,
        },
      });

    if (!assetToken) {
      this.logger.error(reqCtx, `Asset token not found: ${contractAddress}`);
      return;
    }

    const existsAssetTransaction = await this.assetTransactionRepository
      .findOne({
        where: {
          assetTokenId: assetToken.id,
          tx: txHash,
        },
      });

    if (existsAssetTransaction) {
      this.logger.error(reqCtx, `Asset transaction already exists: ${txHash}`);
      return;
    }


    const userWallet = await this.userWalletService.getUserWalletByAddress(
      reqCtx,
      to,
      assetToken.id,
    );

    if (!userWallet) {
      this.logger.error(reqCtx, `User wallet not found: ${to}`);
      return;
    }

    const userBalance = await this.userBalanceService.getOrCreateUserBalance(
      reqCtx,
      userWallet.userId,
    );

    const usdPrice = await this.tokenPriceService.getTokenPriceInUSD(
      reqCtx,
      assetToken.coingeckoId,
    );

    const usdAmount = new BigNumber(amount).times(usdPrice);

    const networkFeeUsdAmount = new BigNumber(fee).times(usdPrice);

    const minDepositAmountUsd = await this.systemConfigService.getMinDepositAmountUsd(reqCtx);

    if (usdAmount.lt(minDepositAmountUsd)) {
      this.logger.error(reqCtx, `USD amount is less than minimum: ${usdAmount.toString()}`);

      const assetTransaction = await this.assetTransactionRepository
        .create({
          amount,
          assetTokenId: assetToken.id,
          tx: txHash,
          userId: userWallet.userId,
          status: AssetTransactionStatusEnum.notQualified,
          finalAmount: amount,
          from,
          to,
          type: AssetTransactionTypeEnum.deposit,
          networkFeeAmount: fee,
          usdAmount: usdAmount.toString(),
          finalUsdAmount: usdAmount.toString(),
          networkFeeUsdAmount: networkFeeUsdAmount.toString(),
          referralRewardAmount: '0',
          failedReason: `Deposit amount is less than minimum deposit amount: ${minDepositAmountUsd}, amount: ${usdAmount.toString()}`
        });

      await this.assetTransactionRepository
        .save(assetTransaction);

      return;
    }

    await this.userBalanceService.increaseBalance(
      reqCtx,
      userBalance.userId,
      usdAmount.toString(),
    );

    const userReferral = await this.userReferralRepository.findOne({
      where: {
        userId: userWallet.userId,
      },
    });
    let referralRewardAmount = '0';
    if (userReferral) {
      const reward = await this.rewardService.getOrCreateReward(
        reqCtx,
        userReferral.referredBy,
      )

      const percentage = await this.systemConfigService.getReferralRewardPercentage(reqCtx);

      referralRewardAmount = usdAmount.times(percentage).div(100).toString();

      if (reward) {
        await this.rewardService.increaseReward(
          reqCtx,
          reward.userId,
          referralRewardAmount,
        );

        await this.userReferralService.increaseRewardAmount(
          reqCtx,
          userReferral.userId,
          referralRewardAmount,
        );
      }
    }

    const assetTransaction = await this.assetTransactionRepository
      .create({
        amount,
        assetTokenId: assetToken.id,
        tx: txHash,
        userId: userWallet.userId,
        status: AssetTransactionStatusEnum.completed,
        finalAmount: amount,
        from,
        to,
        type: AssetTransactionTypeEnum.deposit,
        networkFeeAmount: fee,
        usdAmount: usdAmount.toString(),
        finalUsdAmount: usdAmount.toString(),
        networkFeeUsdAmount: networkFeeUsdAmount.toString(),
        referralRewardAmount,
      });

    await this.assetTransactionRepository
      .save(assetTransaction);
  }

  async handleDepositDeadLetter(
    _: KafkaContext,
    reqCtx: RequestContext,
    message: DeadLetterMessage<DepositEvent>,
  ) {
    if (message.retryCount >= 5) {
      await this.telegramBotService.sendMessage(
        this.config.telegram.alarmChatId,
        `Retry count reached for deposit event: ${JSON.stringify(message)}`,
      );
      this.logger.error(
        reqCtx,
        `Retry count reached for deposit event: ${JSON.stringify(message)}`,
      );
      return;
    }

    await this.handleDeposit(_, reqCtx, message.message);
  }

  async handleNewDepositDeadLetter(
    _: KafkaContext,
    reqCtx: RequestContext,
    message: DeadLetterMessage<DepositEvent>,
  ) {
    this.logger.log(reqCtx, `Dead letter queue: ${message}`);
    this.depositCrawlerMicroservice.emit<DeadLetterMessage<DepositEvent>>(
      DEPOSIT_CRAWLER_DEAD_LETTER_EVENT,
      {
        key: `${message.message.chainId}-${message.message.contractAddress}`,
        value: message,
      },
    );
  }
}
