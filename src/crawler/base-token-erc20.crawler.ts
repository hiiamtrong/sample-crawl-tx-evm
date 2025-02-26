import { ClientProxy } from '@nestjs/microservices';
import { ethers } from 'ethers';
import * as fs from 'fs';
import { Redis } from 'ioredis';
import { map } from 'lodash';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { CrawlerTokenErc20Config } from 'src/crawler/models/crawler-config.model';
import { DepositEvent } from 'src/crawler/models/deposit-event.model';
import {
  CRAWLER_CURRENT_BLOCK,
  DEPOSIT_CRAWLER_EVENT,
} from 'src/shared/constants/crawler';
import { AppLogger } from 'src/shared/logger/logger.service';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { v4 as uuidV4 } from 'uuid';

export class BaseTokenErc20Crawler {
  crawlerConfig: CrawlerTokenErc20Config;
  logger: AppLogger;
  abiJson: any;

  constructor(
    private readonly redis: Redis,
    private readonly depositCrawlerMicroservice: ClientProxy,
    private readonly blockchainService: BlockchainService,
    logger: AppLogger,
    crawlerConfig: CrawlerTokenErc20Config,
  ) {
    this.logger = logger;
    this.crawlerConfig = crawlerConfig;
    const abi = fs.readFileSync(this.crawlerConfig.abiPath);
    this.abiJson = JSON.parse(abi.toString());
  }

  async start() {
    const cachedCurrentBlock = await this.redis.get(
      CRAWLER_CURRENT_BLOCK(
        this.crawlerConfig.chainId,
        this.crawlerConfig.contractAddress,
      ),
    );

    let currentBlock = cachedCurrentBlock
      ? parseInt(cachedCurrentBlock)
      : this.crawlerConfig.startBlock;
    while (true) {
      const ctx = new RequestContext({ requestID: uuidV4() });

      const provider = await this.blockchainService.getProvider(
        ctx,
        this.crawlerConfig.network,
      );
      const contract = new ethers.Contract(
        this.crawlerConfig.contractAddress,
        this.abiJson,
        provider,
      );
      try {
        const latestBlock = await provider.getBlockNumber();
        if (currentBlock >= latestBlock) {
          // Sleep 10 seconds
          this.logger.log(
            ctx,
            `[WARN] Current block ${currentBlock} is greater than latest block ${latestBlock}, sleep 10 seconds`,
          );
          await this.sleep(10000);
          continue;
        }

        const nextBlock = Math.min(
          currentBlock + this.crawlerConfig.incrementBlock,
          latestBlock,
        );

        this.logger.log(
          ctx,
          `Start to crawl block ${currentBlock} to ${nextBlock}`,
        );

        const transferEvents = await contract.queryFilter(
          contract.filters.Transfer(),
          currentBlock,
          nextBlock,
        );

        if (transferEvents.length === 0) {
          this.logger.log(
            ctx,
            `[WARN] No transfer events found in block ${currentBlock} to ${nextBlock}`,
          );
          currentBlock = nextBlock;
          continue;
        }

        await Promise.all(
          map(transferEvents, async (event) => {
            this.logger.log(
              ctx,
              `[INFO] Found transfer event with tx: ${event.transactionHash}`,
            );
            const parsedLog = contract.interface.decodeEventLog(
              'Transfer',
              event.data,
              event.topics,
            );

            const { from, to, value } = parsedLog;

            const depositEvent = new DepositEvent({
              txHash: event.transactionHash,
              from,
              to,
              amount: ethers.formatUnits(
                value,
                this.crawlerConfig.tokenDecimals,
              ),
              contractAddress: this.crawlerConfig.contractAddress,
              chainId: this.crawlerConfig.chainId,
              timestamp: Date.now(),
              blockNumber: event.blockNumber,
            });

            const receipt = await provider.getTransactionReceipt(
              event.transactionHash,
            );
            if (receipt) {
              const fee = receipt.gasPrice * receipt.gasUsed;
              const feeInNativeToken = ethers.formatUnits(
                fee,
                this.crawlerConfig.decimals,
              );

              depositEvent.fee = feeInNativeToken;
            }

            this.depositCrawlerMicroservice.emit<DepositEvent>(
              DEPOSIT_CRAWLER_EVENT,
              {
                key: `${this.crawlerConfig.chainId}-${this.crawlerConfig.contractAddress}`,
                value: JSON.stringify(depositEvent),
              },
            );
          }),
        );

        currentBlock = nextBlock;
        await this.redis.set(
          CRAWLER_CURRENT_BLOCK(
            this.crawlerConfig.chainId,
            this.crawlerConfig.contractAddress,
          ),
          currentBlock.toString(),
        );
      } catch (error) {
        console.log(error);
        this.logger.error(ctx, `Error: ${error}`, error);
      }
    }
  }

  async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
