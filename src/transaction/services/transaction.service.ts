import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, KafkaContext } from '@nestjs/microservices';
import { InjectRedis } from '@nestjs-modules/ioredis';
import BigNumber from 'bignumber.js';
import { ethers, TransactionRequest } from 'ethers';
import * as fs from 'fs';
import { Redis } from 'ioredis';
import { includes } from 'lodash';
import {
  AssetToken,
  CurrencyEnum,
} from 'src/asset-token/entities/asset-token.entity';
import { AssetTokenRepository } from 'src/asset-token/repositories/asset-token.repository';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { AppConfigService } from 'src/shared/configs/config.service';
import { ESTIMATE_GAS_FEE_CACHE_KEY } from 'src/shared/constants/cache';
import {
  BLOCKCHAIN_MICROSERVICE,
  SCAN_SEND_FEE_EVENT,
  SCAN_SEND_FEE_EVENT_DEAD_LETTER,
  SCAN_SWEEP_EVENT,
  SCAN_SWEEP_EVENT_DEAD_LETTER,
  SCAN_WITHDRAW_EVENT,
  SCAN_WITHDRAW_EVENT_DEAD_LETTER,
  SWEEP_EVENT,
  WITHDRAW_EVENT
} from 'src/shared/constants/crawler';
import { DeadLetterMessage } from 'src/shared/constants/queue';
import { PaginationResponseDto } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import {
  AppExceptionCode,
  getAppException,
} from 'src/shared/exceptions/app.exception';
import { AppLogger } from 'src/shared/logger/logger.service';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import {
  plainToInstanceCustom,
  plainToInstancesCustom,
} from 'src/shared/utils/class-transform';
import dayjs from 'src/shared/utils/dayjs';
import { decrypt } from 'src/shared/utils/encryption';
import { sleep } from 'src/shared/utils/promise';
import { SystemConfigFundHolderAccountOutputDto } from 'src/system-config/dtos/system-config-output.dto';
import { SystemConfigService } from 'src/system-config/services/system-config.service';
import { TokenPriceService } from 'src/token-price/token-price.service';
import {
  AssetTransactionFilterDto,
  AssetTransactionOutputDto,
} from 'src/transaction/dtos/asset-transaction.dto';
import {
  EstimateFeeInputDto,
  EstimateFeeOutputDto,
  WithdrawInputDto,
  WithdrawOutputDto,
} from 'src/transaction/dtos/withdraw.dto';
import {
  AssetTransaction,
  AssetTransactionStatusEnum,
  AssetTransactionTypeEnum,
} from 'src/transaction/entities/asset-transaction.entity';
import { AssetTransactionRepository } from 'src/transaction/repositories/asset-transaction.repository';
import { UserBalanceService } from 'src/user-balance/services/user-balance.service';
import { UserWalletRepository } from 'src/user-wallet/repositories/user-wallet.repository';
import { Between, Equal, FindOptionsWhere, In, LessThan, MoreThan } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
@Injectable()
export class TransactionService {
  constructor(
    private readonly assetTransactionRepo: AssetTransactionRepository,
    private readonly assetTokenRepo: AssetTokenRepository,
    private readonly userWalletRepo: UserWalletRepository,
    private readonly userBalanceService: UserBalanceService,
    private readonly config: AppConfigService,
    @Inject(BLOCKCHAIN_MICROSERVICE)
    private readonly blockchainMicroservice: ClientProxy,
    private readonly systemConfigService: SystemConfigService,
    private readonly logger: AppLogger,
    @InjectRedis() private readonly redis: Redis,
    private readonly blockchainService: BlockchainService,
    private readonly tokenPriceService: TokenPriceService,
  ) {
    this.logger.setContext(TransactionService.name);
  }

  async myTransactions(
    ctx: RequestContext,
    filter: AssetTransactionFilterDto,
    pagination: PaginationParamsDto,
  ): Promise<PaginationResponseDto<AssetTransactionOutputDto>> {
    const user = ctx.user;
    const { type, from, to } = filter;
    const timezone = ctx.timezone;

    const condition: FindOptionsWhere<AssetTransaction> = {
      userId: user.id,
    };

    // Handle transaction type filter
    if (type) {
      if (!includes([AssetTransactionTypeEnum.deposit, AssetTransactionTypeEnum.withdraw], type)) {
        throw getAppException(AppExceptionCode.INVALID_PARAMS);
      }
      condition.type = Equal(type);
    } else {
      condition.type = In([AssetTransactionTypeEnum.deposit, AssetTransactionTypeEnum.withdraw]);
    }

    // Handle date range filter
    if (from || to) {

      if (from) {
        const fromStartOfDay = dayjs.tz(from, timezone).startOf('day');
        condition.createdAt = MoreThan(fromStartOfDay.toDate());
      }

      if (to) {
        const toEndOfDay = dayjs.tz(to, timezone).endOf('day');
        if (from) {
          const fromStartOfDay = dayjs.tz(from, timezone).startOf('day');
          // If we have both from and to dates, use Between operator
          condition.createdAt = Between(
            fromStartOfDay.toDate(),
            toEndOfDay.toDate()
          );
        } else {
          condition.createdAt = LessThan(toEndOfDay.toDate());
        }
      }
    }

    const assetTransactions = await this.assetTransactionRepo

      .find({
        where: condition,
        order: { createdAt: 'DESC' },
        skip: pagination.page * pagination.limit,
        take: pagination.limit,
        relations: ['assetToken'],
      });

    const total = await this.assetTransactionRepo

      .count({ where: condition });

    const resp = {
      data: plainToInstancesCustom(
        AssetTransactionOutputDto,
        assetTransactions,
      ),
      total,
      page: pagination.page,
    };

    return plainToInstanceCustom(
      PaginationResponseDto<AssetTransactionOutputDto>,
      resp,
    );
  }

  @Transactional()
  async withdraw(ctx: RequestContext, body: WithdrawInputDto) {
    const user = ctx.user;
    const assetToken = await this.assetTokenRepo

      .findOne({
        where: { id: body.assetTokenId },
      });

    if (!assetToken) {
      throw getAppException(AppExceptionCode.ASSET_TOKEN_NOT_FOUND);
    }

    const { amount: amountUsd, address, assetTokenId } = body;

    const userBalance = await this.userBalanceService.getOrCreateUserBalance(
      ctx,
      user.id,
    );

    const {
      amountInToken,
      finalAmountInToken,
      feeInNativeToken,
      feeInUsd,
      amountInUsd,
      finalUsdAmount,
    } = await this.estimateWithdraw(ctx, {
      address,
      amount: amountUsd,
      assetTokenId,
    });

    if (new BigNumber(amountInUsd).gt(userBalance.amount)) {
      throw getAppException(AppExceptionCode.INSUFFICIENT_BALANCE);
    }

    const tx = await this.assetTransactionRepo
      .create({
        type: AssetTransactionTypeEnum.withdraw,
        userId: user.id,
        status: AssetTransactionStatusEnum.pending,
        assetTokenId: assetToken.id,
        amount: amountInToken,
        finalAmount: finalAmountInToken,
        networkFeeAmount: feeInNativeToken,
        networkFeeUsdAmount: feeInUsd,
        usdAmount: amountInUsd,
        finalUsdAmount,
        to: address,
      });

    await this.assetTransactionRepo.save(tx);

    await this.userBalanceService.decreaseBalance(
      ctx,
      user.id,
      amountInUsd.toString(),
    );

    this.blockchainMicroservice.emit(WITHDRAW_EVENT, {
      key: user.id,
      value: JSON.stringify(tx),
    });

    return plainToInstanceCustom(WithdrawOutputDto, {
      assetTransactionId: tx.id,
    });
  }

  async estimateWithdraw(
    ctx: RequestContext,
    body: EstimateFeeInputDto,
  ): Promise<EstimateFeeOutputDto> {
    const { assetTokenId, amount: amountUsd, address } = body;
    const assetToken = await this.assetTokenRepo
      .findOne({
        where: { id: assetTokenId },
      });

    if (!assetToken) {
      throw getAppException(AppExceptionCode.ASSET_TOKEN_NOT_FOUND);
    }

    // Todo: get fee from contract or config
    const gasUsdPrice = await this.tokenPriceService.getTokenPriceInUSD(
      ctx,
      assetToken.nativeTokenCoingeckoId,
    );

    const usdPrice = await this.tokenPriceService.getTokenPriceInUSD(
      ctx,
      assetToken.coingeckoId,
    );

    const amountInToken = new BigNumber(amountUsd)
      .div(usdPrice)
      .toFixed(assetToken.decimals)
      .toString();

    const estGas = await this.estimateGasFee(
      ctx,
      assetToken,
      address,
      amountInToken,
    );

    const slipRate = await this.systemConfigService.getWithdrawalFeeRate(ctx);

    const feeInNativeTokenWithSlipRate = new BigNumber(estGas.gasFeeInToken).plus(
      new BigNumber(estGas.gasFeeInToken).times(slipRate / 100),
    );

    const feeInUsd = new BigNumber(feeInNativeTokenWithSlipRate).times(gasUsdPrice);

    const output = new EstimateFeeOutputDto();
    output.feeInUsd = feeInUsd.toString();
    output.feeInNativeToken = feeInNativeTokenWithSlipRate.toString();
    output.amountInUsd = amountUsd;
    output.finalUsdAmount = new BigNumber(amountUsd).minus(feeInUsd).toString();
    output.amountInToken = new BigNumber(amountUsd)
      .div(usdPrice)
      .toFixed(assetToken.decimals)
      .toString();
    output.finalAmountInToken = new BigNumber(output.finalUsdAmount)
      .div(usdPrice)
      .toFixed(assetToken.decimals)
      .toString();
    return plainToInstanceCustom(EstimateFeeOutputDto, output);
  }

  async estimateGasFee(
    ctx: RequestContext,
    assetToken: AssetToken,
    address: string,
    amountInToken: string,
  ): Promise<{
    gasFeeInToken: string;
    gasFee: string;
    gasLimit: string;
    gasPrice: string;
    exactGasLimit: string;
  }> {
    const cacheKey = ESTIMATE_GAS_FEE_CACHE_KEY(assetToken.network);
    const cache = await this.redis.get(cacheKey);
    if (cache) {
      return JSON.parse(cache);
    }

    const provider = await this.blockchainService.getWriteProvider(
      ctx,
      assetToken.network,
    );
    const signer = new ethers.Wallet(
      this.config.blockchainAdmin.privateKey,
      provider,
    );

    let gasLimit;
    let gasPrice;
    let exactGasLimit;

    if (!assetToken.isNative) {
      let abiPath;
      switch (assetToken.currency) {
        case CurrencyEnum.USDT:
          abiPath = 'src/crawler/abis/usdt.json';
          break;
        case CurrencyEnum.USDC:
          abiPath = 'src/crawler/abis/usdc.json';
          break;
        case CurrencyEnum.ETH:
          abiPath = 'src/crawler/abis/eth.json';
          break;
        default:
          throw getAppException(AppExceptionCode.ASSET_TOKEN_NOT_FOUND);
      }
      const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

      const contract = new ethers.Contract(
        assetToken.contractAddress,
        abi,
        signer,
      );

      exactGasLimit = await contract.transfer.estimateGas(
        address,
        ethers.parseUnits(amountInToken, assetToken.decimals),
      );

      if (exactGasLimit < BigInt(this.config.gasLimitErc20Transfer)) {
        gasLimit = BigInt(this.config.gasLimitErc20Transfer);
      } else {
        gasLimit = exactGasLimit;
      }
      gasPrice = (await provider.getFeeData()).gasPrice;
    } else {
      const tx: TransactionRequest = {
        to: address,
        data: ethers.AbiCoder.defaultAbiCoder().encode(
          ['uint256'],
          [ethers.parseUnits(amountInToken, assetToken.decimals)],
        ),
      };

      exactGasLimit = await provider.estimateGas(tx);

      if (exactGasLimit < BigInt(this.config.gasLimitNativeTokenTransfer)) {
        gasLimit = BigInt(this.config.gasLimitNativeTokenTransfer);
      } else {
        gasLimit = exactGasLimit;
      }

      gasPrice = (await provider.getFeeData()).gasPrice;
    }

    const gasFee = new BigNumber(gasPrice.toString())
      .times(gasLimit.toString())
      .toString();


    const feeInToken = ethers.formatUnits(gasFee, assetToken.decimals);

    this.logger.log(ctx, `Network: ${assetToken.network}, Token: ${assetToken.symbol}, Gas price: ${gasPrice.toString()}, gas limit: ${gasLimit.toString()}, gas limit exact: ${exactGasLimit.toString()}, gas fee: ${gasFee}, fee in token: ${feeInToken}`);
    // Cache fee in token for 1 minute
    const resp = {
      gasFeeInToken: feeInToken,
      gasFee,
      gasLimit: gasLimit.toString(),
      gasPrice: gasPrice.toString(),
      exactGasLimit: exactGasLimit.toString(),
    }
    await this.redis.set(cacheKey, JSON.stringify(resp), 'EX', 10);
    return resp;
  }

  @Transactional()
  async handleWithdrawEvent(
    kafkaCtx: KafkaContext,
    ctx: RequestContext,
    body: AssetTransaction,
  ) {
    const heartbeat = kafkaCtx.getHeartbeat();

    // Interval send heartbeat to kafka
    const heartbeatInterval = setInterval(async () => {
      await heartbeat();
    }, 3000);
    let txHash: string;

    try {
      const { to, assetTokenId, finalAmount } = body;
      const privateKey = this.config.blockchainAdmin.privateKey;

      const assetToken = await this.assetTokenRepo

        .findOne({ where: { id: assetTokenId } });

      if (!assetToken) {
        throw getAppException(AppExceptionCode.ASSET_TOKEN_NOT_FOUND);
      }

      let abiPath;
      switch (assetToken.currency) {
        case CurrencyEnum.USDT:
          abiPath = 'src/crawler/abis/usdt.json';
          break;
        case CurrencyEnum.USDC:
          abiPath = 'src/crawler/abis/usdc.json';
          break;
        case CurrencyEnum.ETH:
          abiPath = 'src/crawler/abis/eth.json';
          break;
        default:
          throw getAppException(AppExceptionCode.ASSET_TOKEN_NOT_FOUND);
      }
      console.log({ assetToken })

      const provider = await this.blockchainService.getWriteProvider(
        ctx,
        assetToken.network,
      );

      const wallet = new ethers.Wallet(privateKey, provider);
      body.from = wallet.address;
      let tx: ethers.TransactionResponse;
      if (!assetToken.isNative) {
        const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
        const contract = new ethers.Contract(
          assetToken.contractAddress,
          abi,
          wallet,
        );

        // Add nonce to tx to prevent nonce expired
        const nonce = await provider.getTransactionCount(
          wallet.address,
          'pending',
        );

        const amountInWei = ethers.parseUnits(finalAmount, assetToken.decimals);

        const unsignTx = await contract.transfer.populateTransaction(
          to,
          amountInWei,
        );

        unsignTx.nonce = nonce;
        unsignTx.chainId = BigInt(assetToken.chainId);
        unsignTx.maxFeePerGas = ethers.parseUnits('10', 'gwei');
        unsignTx.maxPriorityFeePerGas = ethers.parseUnits('2', 'gwei');
        unsignTx.value = BigInt(0);
        unsignTx.gasLimit = BigInt(this.config.gasLimitErc20Transfer);

        const signedTx = await wallet.signTransaction(unsignTx);
        txHash = ethers.Transaction.from(signedTx).hash;

        await this.assetTransactionRepo
          .update(body.id, {
            tx: txHash,
          });

        body.tx = txHash;
        tx = await provider.broadcastTransaction(signedTx);
      } else {
        const nonce = await provider.getTransactionCount(
          wallet.address,
          'pending',
        );

        const unsignTx = {
          to: to,
          value: ethers.parseEther(finalAmount),
          gasLimit: BigInt(this.config.gasLimitNativeTokenTransfer),
          nonce,
          chainId: BigInt(assetToken.chainId),
          maxFeePerGas: ethers.parseUnits('10', 'gwei'),
          maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei'),
        };

        const signedTx = await wallet.signTransaction(unsignTx);
        txHash = await ethers.keccak256(signedTx);

        await this.assetTransactionRepo
          .update(body.id, {
            tx: txHash,
          });

        body.tx = txHash;

        tx = await wallet.sendTransaction(unsignTx);
      }
      // Add transaction to a queue, this task will process after 30s
      return tx;
    } catch (error) {
      this.logger.error(ctx, `Error when handle withdraw event: ${error}`);
      if (!txHash) {
        this.logger.error(ctx, `Error when handle withdraw event: ${error}`);
        await this.assetTransactionRepo
          .update(body.id, {
            status: AssetTransactionStatusEnum.failed,
            failedReason: JSON.stringify(error),
          });

        await this.userBalanceService.increaseBalance(
          ctx,
          body.userId,
          body.usdAmount,
        );
      }
    } finally {
      if (txHash) {
        this.scheduleWithdrawScan(body);
      }
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
    }
  }

  private scheduleWithdrawScan(body: AssetTransaction): void {
    this.blockchainMicroservice.emit(SCAN_WITHDRAW_EVENT, {
      key: body.userId,
      value: JSON.stringify(body),
    });
  }

  @Transactional()
  async handleScanWithdrawEvent(
    ctx: KafkaContext,
    reqCtx: RequestContext,
    body: AssetTransaction,
  ) {
    const { id, tx, assetTokenId } = body;
    const existingTx = await this.assetTransactionRepo.findOne({ where: { id } });

    if (!existingTx) {
      this.logger.warn(
        reqCtx,
        `Withdraw transaction ${tx} for asset token ${assetTokenId} is not found`,
      );
      return;
    }

    if (
      includes(
        [
          AssetTransactionStatusEnum.completed,
          AssetTransactionStatusEnum.failed,
        ],
        existingTx.status,
      )
    ) {
      this.logger.warn(
        reqCtx,
        `Withdraw transaction ${tx} for asset token ${assetTokenId} is already processed`,
      );
      return;
    }

    const heartbeat = ctx.getHeartbeat();

    // Interval send heartbeat to kafka
    const heartbeatInterval = setInterval(async () => {
      await heartbeat();
    }, 3000);

    try {
      const assetToken = await this.assetTokenRepo

        .findOne({ where: { id: assetTokenId } });

      if (!assetToken) {
        throw getAppException(AppExceptionCode.ASSET_TOKEN_NOT_FOUND);
      }

      const provider = await this.blockchainService.getProvider(
        reqCtx,
        assetToken.network,
      );

      const receipt = await provider.getTransactionReceipt(tx);
      if (!receipt) {
        const now = new Date();
        // if after 1 hour, the transaction is still not included in a block, we consider it failed
        if (now.getTime() - existingTx.createdAt.getTime() > 60 * 60 * 1000) {
          await this.assetTransactionRepo

            .update(body.id, {
              status: AssetTransactionStatusEnum.failed,
            });

          await this.userBalanceService.increaseBalance(
            reqCtx,
            existingTx.userId,
            existingTx.usdAmount,
          );
        } else {
          await sleep(5000);
          this.scheduleWithdrawScan(body);
        }
        return;
      }
      if (receipt.status === 1) {
        await this.assetTransactionRepo

          .update(body.id, {
            status: AssetTransactionStatusEnum.completed,
          });
      } else if (receipt.status === 0) {
        await this.assetTransactionRepo

          .update(body.id, {
            status: AssetTransactionStatusEnum.failed,
            failedReason: 'Withdraw transaction failed',
          });

        await this.userBalanceService.increaseBalance(
          reqCtx,
          existingTx.userId,
          body.usdAmount,
        );
      }
    } finally {
      clearInterval(heartbeatInterval);
    }
  }

  async handleNewWithdrawDeadLetter(
    _: KafkaContext,
    __: RequestContext,
    body: DeadLetterMessage<AssetTransaction>,
  ) {
    setTimeout(() => {
      this.blockchainMicroservice.emit<DeadLetterMessage<AssetTransaction>>(
        SCAN_WITHDRAW_EVENT_DEAD_LETTER,
        {
          key: body.message.tx,
          value: JSON.stringify(body),
        },
      );
    }, 30000);
  }

  async handleScanWithdrawDeadLetter(
    ctx: KafkaContext,
    reqCtx: RequestContext,
    body: DeadLetterMessage<AssetTransaction>,
  ) {
    await this.handleScanWithdrawEvent(ctx, reqCtx, body.message);
  }


  async scanSweep(ctx: RequestContext) {
    // Loop through all user wallets and get balance of all asset tokens
    const assetTokens = await this.assetTokenRepo.find();
    const userWallets = await this.userWalletRepo.find();
    const minSweepAmountUsd = await this.systemConfigService.getMinSweepAmountUSD(ctx);
    const fundHolderAccounts: SystemConfigFundHolderAccountOutputDto[] = await this.systemConfigService.getFundHolderAccount(ctx);

    const mapFundHolderAccount = fundHolderAccounts.reduce((acc, curr) => {
      acc[curr.network] = curr.address;
      return acc;
    }, {});

    for (const userWallet of userWallets) {
      for (const assetToken of assetTokens) {
        const balance = await this.blockchainService.getTokenBalance(ctx, userWallet.address, assetToken);
        const price = await this.tokenPriceService.getTokenPriceInUSD(ctx, assetToken.coingeckoId);
        if (!price) {
          this.logger.warn(ctx, `Price for token ${assetToken.id} is not found, skip sweep`);
          continue;
        }
        const balanceInUsd = new BigNumber(balance).times(price).toString();
        if (new BigNumber(balanceInUsd).lte(minSweepAmountUsd)) {
          this.logger.log(ctx, `Balance of ${userWallet.address} for asset token ${assetToken.id} is less than ${minSweepAmountUsd} USD, skip sweep`);
          continue;
        }

        const fundHolderAccount = mapFundHolderAccount[assetToken.network];

        if (!fundHolderAccount) {
          this.logger.warn(ctx, `Fund holder account for network ${assetToken.network} is not found, skip sweep`);
          continue;
        }

        const existingTx = await this.assetTransactionRepo.findOne({ where: { type: AssetTransactionTypeEnum.sweep, userId: userWallet.userId, assetTokenId: assetToken.id, status: AssetTransactionStatusEnum.pending } });
        if (existingTx) {
          this.logger.warn(ctx, `Existing sweep transaction for user ${userWallet.userId} and asset token ${assetToken.id}, skip sweep`);
          continue;
        }

        const tx = await this.assetTransactionRepo
          .create({
            type: AssetTransactionTypeEnum.sweep,
            userId: userWallet.userId,
            status: AssetTransactionStatusEnum.pending,
            assetTokenId: assetToken.id,
            amount: balance,
            finalAmount: balance,
            networkFeeAmount: '0',
            networkFeeUsdAmount: '0',
            usdAmount: balanceInUsd,
            finalUsdAmount: balanceInUsd,
            from: userWallet.address,
            to: fundHolderAccount,
          });

        await this.assetTransactionRepo.save(tx);

        this.blockchainMicroservice.emit(SWEEP_EVENT, {
          key: userWallet.userId,
          value: JSON.stringify(tx),
        });
      }
    }
  }

  async handleSweepEvent(
    ctx: KafkaContext,
    reqCtx: RequestContext,
    body: AssetTransaction,
  ) {
    const heartbeat = ctx.getHeartbeat();

    // Interval send heartbeat to kafka
    const heartbeatInterval = setInterval(async () => {
      await heartbeat();
    }, 3000);

    let step = 0;
    let sendFeeTx: AssetTransaction;
    let existingTx: AssetTransaction;
    let exactlyTx


    try {
      const { id, assetTokenId, from, to } = body;
      const assetToken = await this.assetTokenRepo.findOne({ where: { id: assetTokenId } });

      if (!assetToken) {
        throw getAppException(AppExceptionCode.ASSET_TOKEN_NOT_FOUND);
      }

      existingTx = await this.assetTransactionRepo.findOne({ where: { id } });

      if (!existingTx) {
        this.logger.warn(reqCtx, `Sweep transaction id ${id} is not found`);
        return;
      }

      const provider = await this.blockchainService.getProvider(
        reqCtx,
        assetToken.network,
      );

      const writeProvider = await this.blockchainService.getWriteProvider(
        reqCtx,
        assetToken.network,
      );

      const estGas = await this.estimateGasFee(reqCtx, assetToken, from, body.amount);
      const price = await this.tokenPriceService.getTokenPriceInUSD(reqCtx, assetToken.nativeTokenCoingeckoId);
      const feeBalance = await this.blockchainService.getNativeBalance(reqCtx, from, assetToken);
      const adminWallet = new ethers.Wallet(this.config.blockchainAdmin.privateKey, writeProvider);
      const safeFeeRate = 2
      if (new BigNumber(feeBalance).lt(new BigNumber(estGas.gasFeeInToken).times(safeFeeRate))) {
        await this.assetTransactionRepo.update(id, {
          status: AssetTransactionStatusEnum.failed,
          failedReason: 'Balance of wallet is not enough to pay for gas fee',
        });
        step = 1;
        // Check if has existing tx to pay for gas fee
        const existingSendFeeTx = await this.assetTransactionRepo.findOne({ where: { type: AssetTransactionTypeEnum.sendFee, to: from, assetTokenId: assetToken.id, status: AssetTransactionStatusEnum.pending } });
        if (existingSendFeeTx) {
          this.logger.warn(reqCtx, `Existing send fee transaction to ${from} for asset token ${assetToken.id}, skip send fee`);
          return;
        }

        // Calculate fee remain and increase 10% to balance
        this.logger.warn(reqCtx, `Balance of ${from} is not enough to pay for gas fee, skip sweep`);
        // Calculate fee remain and increase 10% to balance
        const feeRemain = new BigNumber(estGas.gasFeeInToken).times(safeFeeRate).toFixed(assetToken.feeDecimals);
        this.logger.log(reqCtx, `Fee remain: ${feeRemain}`);
        this.logger.log(reqCtx, `Fee remain in Token: ${ethers.parseUnits(feeRemain, assetToken.feeDecimals)}`);
        const price = await this.tokenPriceService.getTokenPriceInUSD(reqCtx, assetToken.nativeTokenCoingeckoId);
        const feeUsdAmount = new BigNumber(feeRemain).times(price).toString();
        const nonce = await provider.getTransactionCount(adminWallet.address, 'pending');
        const sendFeeTxUnsign = {
          to: from,
          value: ethers.parseUnits(feeRemain, assetToken.feeDecimals),
          gasLimit: BigInt(estGas.exactGasLimit),
          nonce,
          chainId: BigInt(assetToken.chainId),
          maxFeePerGas: ethers.parseUnits('10', 'gwei'),
          maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei'),
        }

        const signedTx = await adminWallet.signTransaction(sendFeeTxUnsign);
        const txHash = await ethers.keccak256(signedTx);
        const nativeToken = await this.assetTokenRepo.findOne({ where: { network: assetToken.network, isNative: true } });
        if (!nativeToken) {
          throw getAppException(AppExceptionCode.ASSET_TOKEN_NOT_FOUND);
        }
        sendFeeTx = await this.assetTransactionRepo.create({
          type: AssetTransactionTypeEnum.sendFee,
          userId: existingTx.userId,
          status: AssetTransactionStatusEnum.pending,
          assetTokenId: nativeToken.id,
          amount: feeRemain,
          usdAmount: feeUsdAmount,
          finalUsdAmount: feeUsdAmount,
          finalAmount: feeRemain,
          networkFeeAmount: feeRemain,
          networkFeeUsdAmount: feeUsdAmount,
          from: adminWallet.address,
          to: from,
          tx: txHash,
        })

        await this.assetTransactionRepo.save(sendFeeTx);
        exactlyTx = txHash;
        this.blockchainMicroservice.emit(SCAN_SEND_FEE_EVENT, {
          key: id,
          value: JSON.stringify(sendFeeTx),
        });

        await adminWallet.sendTransaction(sendFeeTxUnsign)
        return;
      }

      const userWallet = await this.userWalletRepo.findOne({ where: { userId: existingTx.userId, assetTokenId: assetToken.id } });

      if (!userWallet) {
        this.logger.warn(reqCtx, `User wallet for user ${existingTx.userId} and asset token ${assetToken.id} is not found, skip sweep`);
        return;
      }


      if (userWallet.address !== from) {
        this.logger.warn(reqCtx, `User wallet address ${userWallet.address} is not match with from address ${from}, skip sweep`);
        return;
      }

      const encodedPrivateKey = await userWallet.privateKey;
      const privateKey = await decrypt(
        this.config.crypto.secret,
        this.config.crypto.iv,
        encodedPrivateKey,
      );


      if (!privateKey) {
        this.logger.warn(reqCtx, `User wallet private key for user ${existingTx.userId} and asset token ${assetToken.id} is not found, skip sweep`);
        return;
      }



      const wallet = new ethers.Wallet(privateKey, writeProvider);
      const nonce = await writeProvider.getTransactionCount(wallet.address, 'pending');

      if (assetToken.isNative) {
        const unsignTx = {
          to: from,
          value: ethers.parseUnits(body.amount, assetToken.decimals),
          gasLimit: BigInt(this.config.gasLimitNativeTokenTransfer),
          nonce,
          chainId: BigInt(assetToken.chainId),
          maxFeePerGas: ethers.parseUnits('10', 'gwei'),
          maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei'),
        }

        const signedTx = await wallet.signTransaction(unsignTx);
        const txHash = await ethers.keccak256(signedTx);


        existingTx.tx = txHash;
        existingTx.networkFeeAmount = estGas.gasFeeInToken;
        existingTx.networkFeeUsdAmount = new BigNumber(estGas.gasFeeInToken).times(price).toString();
        await this.assetTransactionRepo.save(existingTx);
        exactlyTx = txHash;
        this.blockchainMicroservice.emit(SCAN_SWEEP_EVENT, {
          key: id,
          value: JSON.stringify(existingTx),
        });
        await wallet.sendTransaction(unsignTx)
      } else {
        const abi = await this.blockchainService.getTokenAbi(assetToken.currency);
        const contract = new ethers.Contract(
          assetToken.contractAddress,
          abi,
          wallet,
        )
        const amountInWei = ethers.parseUnits(body.amount, assetToken.decimals);

        const unsignTx = await contract.transfer.populateTransaction(
          to,
          amountInWei,
        );
        unsignTx.nonce = nonce;
        unsignTx.chainId = BigInt(assetToken.chainId);
        unsignTx.maxFeePerGas = ethers.parseUnits('10', 'gwei');
        unsignTx.maxPriorityFeePerGas = ethers.parseUnits('2', 'gwei');
        unsignTx.value = BigInt(0);
        unsignTx.gasLimit = BigInt(estGas.exactGasLimit);

        const signedTx = await wallet.signTransaction(unsignTx);
        const txHash = ethers.Transaction.from(signedTx).hash;
        existingTx.tx = txHash;
        await this.assetTransactionRepo.save(existingTx);
        exactlyTx = txHash;
        this.blockchainMicroservice.emit(SCAN_SWEEP_EVENT, {
          key: id,
          value: JSON.stringify(existingTx),
        });
        await provider.broadcastTransaction(signedTx);
      }
    } catch (error) {
      this.logger.error(reqCtx, `Error when handle sweep event: ${error} - Step: ${step}`, { stacktrace: error.stack });

      if (step === 1) {
        if (!sendFeeTx) {
          return;
        }
        if (!exactlyTx) {
          await this.assetTransactionRepo.update(sendFeeTx.id, {
            status: AssetTransactionStatusEnum.failed,
            failedReason: JSON.stringify(error),
          });
          return;
        }

        return;
      }

      if (!exactlyTx) {
        await this.assetTransactionRepo.update(existingTx.id, {
          status: AssetTransactionStatusEnum.failed,
          failedReason: JSON.stringify(error),
        });
      }



    } finally {
      clearInterval(heartbeatInterval);
    }
  }

  async handleScanSendFeeEvent(
    ctx: KafkaContext,
    reqCtx: RequestContext,
    body: AssetTransaction,
  ) {

    const heartbeat = ctx.getHeartbeat();

    // Interval send heartbeat to kafka
    const heartbeatInterval = setInterval(async () => {
      await heartbeat();
    }, 3000);


    const { id, tx, assetTokenId } = body;
    const existingTx = await this.assetTransactionRepo.findOne({ where: { id } });

    if (!existingTx) {
      this.logger.warn(
        reqCtx,
        `Send fee transaction ${tx} for asset token ${assetTokenId} is not found`,
      );
      return;
    }

    if (
      includes(
        [
          AssetTransactionStatusEnum.completed,
          AssetTransactionStatusEnum.failed,
        ],
        existingTx.status,
      )
    ) {
      this.logger.warn(
        reqCtx,
        `Send fee transaction ${tx} for asset token ${assetTokenId} is already processed`,
      );
      return;
    }

    try {
      const assetToken = await this.assetTokenRepo
        .findOne({ where: { id: assetTokenId } });

      if (!assetToken) {
        throw getAppException(AppExceptionCode.ASSET_TOKEN_NOT_FOUND);
      }

      const provider = await this.blockchainService.getProvider(
        reqCtx,
        assetToken.network,
      );

      const receipt = await provider.getTransactionReceipt(tx);
      if (!receipt) {
        const now = new Date();
        // if after 30 minutes, the transaction is still not included in a block, we consider it failed
        if (now.getTime() - existingTx.createdAt.getTime() > 30 * 60 * 1000) {
          await this.assetTransactionRepo
            .update(body.id, {
              status: AssetTransactionStatusEnum.failed,
            });
        } else {
          await sleep(5000);
          this.scheduleSendFeeScan(body);
        }
        return;
      }
      if (receipt.status === 1) {
        await this.assetTransactionRepo
          .update(body.id, {
            status: AssetTransactionStatusEnum.completed,
          });
      } else if (receipt.status === 0) {
        await this.assetTransactionRepo
          .update(body.id, {
            status: AssetTransactionStatusEnum.failed,
            failedReason: 'Send fee transaction failed',
          });
      }
    } finally {
      clearInterval(heartbeatInterval);
    }
  }

  private scheduleSendFeeScan(body: AssetTransaction): void {
    this.blockchainMicroservice.emit(SCAN_SEND_FEE_EVENT, {
      key: body.userId,
      value: JSON.stringify(body),
    });
  }

  async handleNewScanSendFeeDeadLetter(
    _: KafkaContext,
    __: RequestContext,
    body: DeadLetterMessage<AssetTransaction>,
  ) {
    setTimeout(() => {
      this.blockchainMicroservice.emit<DeadLetterMessage<AssetTransaction>>(
        SCAN_SEND_FEE_EVENT_DEAD_LETTER,
        {
          key: body.message.tx,
          value: JSON.stringify(body),
        },
      );
    }, 30000);
  }

  async handleScanSendFeeDeadLetter(
    ctx: KafkaContext,
    reqCtx: RequestContext,
    body: DeadLetterMessage<AssetTransaction>,
  ) {
    await this.handleScanSendFeeEvent(ctx, reqCtx, body.message);
  }


  async handleScanSweepDeadLetter(
    ctx: KafkaContext,
    reqCtx: RequestContext,
    body: DeadLetterMessage<AssetTransaction>,
  ) {
    await this.handleScanSweepEvent(ctx, reqCtx, body.message);
  }

  async handleScanSweepEvent(
    ctx: KafkaContext,
    reqCtx: RequestContext,
    body: AssetTransaction,
  ) {
    const heartbeat = ctx.getHeartbeat();

    // Interval send heartbeat to kafka
    const heartbeatInterval = setInterval(async () => {
      await heartbeat();
    }, 3000);

    const { id, tx, assetTokenId } = body;
    const existingTx = await this.assetTransactionRepo.findOne({ where: { id } });

    if (!existingTx) {
      this.logger.warn(
        reqCtx,
        `Sweep transaction ${tx} for asset token ${assetTokenId} is not found`,
      );
      return;
    }

    if (
      includes(
        [
          AssetTransactionStatusEnum.completed,
          AssetTransactionStatusEnum.failed,
        ],
        existingTx.status,
      )
    ) {
      this.logger.warn(
        reqCtx,
        `Sweep transaction ${tx} for asset token ${assetTokenId} is already processed`,
      );
      return;
    }

    try {
      const assetToken = await this.assetTokenRepo
        .findOne({ where: { id: assetTokenId } });

      if (!assetToken) {
        throw getAppException(AppExceptionCode.ASSET_TOKEN_NOT_FOUND);
      }

      const provider = await this.blockchainService.getProvider(
        reqCtx,
        assetToken.network,
      );

      const receipt = await provider.getTransactionReceipt(tx);
      if (!receipt) {
        const now = new Date();
        // if after 30 minutes, the transaction is still not included in a block, we consider it failed
        if (now.getTime() - existingTx.createdAt.getTime() > 30 * 60 * 1000) {
          await this.assetTransactionRepo
            .update(body.id, {
              status: AssetTransactionStatusEnum.failed,
            });
        } else {
          await sleep(5000);
          this.scheduleSweepScan(body);
        }
        return;
      }
      if (receipt.status === 1) {
        await this.assetTransactionRepo
          .update(body.id, {
            status: AssetTransactionStatusEnum.completed,
          });
      } else if (receipt.status === 0) {
        await this.assetTransactionRepo
          .update(body.id, {
            status: AssetTransactionStatusEnum.failed,
            failedReason: 'Sweep transaction failed',
          });
      }
    } finally {
      clearInterval(heartbeatInterval);
    }
  }

  async handleNewScanSweepDeadLetter(
    _: KafkaContext,
    __: RequestContext,
    body: DeadLetterMessage<AssetTransaction>,
  ) {
    setTimeout(() => {
      this.blockchainMicroservice.emit<DeadLetterMessage<AssetTransaction>>(
        SCAN_SWEEP_EVENT_DEAD_LETTER,
        {
          key: body.message.tx,
          value: JSON.stringify(body),
        },
      );
    }, 30000);
  }

  private scheduleSweepScan(body: AssetTransaction): void {
    this.blockchainMicroservice.emit(SCAN_SWEEP_EVENT, {
      key: body.userId,
      value: JSON.stringify(body),
    });
  }

}
