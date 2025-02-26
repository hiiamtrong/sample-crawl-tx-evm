import { ClientProxy } from '@nestjs/microservices';
import { ethers } from 'ethers';
import { Redis } from 'ioredis';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { CrawlerTokenNativeConfig } from 'src/crawler/models/crawler-config.model';
import { DepositEvent } from 'src/crawler/models/deposit-event.model';
import {
  CRAWLER_CURRENT_BLOCK,
  DEPOSIT_CRAWLER_EVENT,
} from 'src/shared/constants/crawler';
import { AppLogger } from 'src/shared/logger/logger.service';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { sleep } from 'src/shared/utils/promise';
import { v4 as uuidV4 } from 'uuid';

export class BaseTokenNativeCrawler {
  crawlerConfig: CrawlerTokenNativeConfig;
  logger: AppLogger;

  constructor(
    private readonly redis: Redis,
    private readonly depositCrawlerMicroservice: ClientProxy,
    private readonly blockchainService: BlockchainService,
    logger: AppLogger,
    crawlerConfig: CrawlerTokenNativeConfig,
  ) {
    this.logger = logger;
    this.crawlerConfig = crawlerConfig;
  }

  async start() {
    const cachedCurrentBlock = await this.redis.get(
      CRAWLER_CURRENT_BLOCK(this.crawlerConfig.chainId, 'native'),
    );

    let currentBlock = cachedCurrentBlock
      ? parseInt(cachedCurrentBlock)
      : this.crawlerConfig.startBlock;

    const ctx = new RequestContext({
      requestID: uuidV4(),
    });

    let provider = await this.blockchainService.getProvider(
      ctx,
      this.crawlerConfig.network,
    );

    let latestBlock = await provider.getBlockNumber();
    const interval = setInterval(async () => {
      latestBlock = await provider.getBlockNumber();
    }, 10000);

    while (true) {
      const ctx = new RequestContext({
        requestID: uuidV4(),
      });

      provider = await this.blockchainService.getProvider(
        ctx,
        this.crawlerConfig.network,
      );

      if (currentBlock > latestBlock) {
        this.logger.log(
          ctx,
          `Current block ${currentBlock} is greater than latest block ${latestBlock}`,
        );
        await sleep(10000);
        continue;
      }

      try {
        this.logger.log(ctx, `Start to crawl block ${currentBlock}`);
        const block = await provider.getBlock(currentBlock, true);
        const transactions = block.transactions;

        this.logger.log(ctx, `Found ${transactions.length} transactions`);

        for (let i = 0; i < transactions.length; i++) {
          const tx = block.getPrefetchedTransaction(i);

          if (tx && tx.value > 0 && tx.to) {
            const fee = tx.gasPrice * tx.gasLimit;
            const feeInNativeToken = ethers.formatUnits(
              fee,
              this.crawlerConfig.decimals,
            );

            const depositEvent = new DepositEvent({
              txHash: tx.hash,
              from: tx.from,
              to: tx.to,
              amount: ethers.formatEther(tx.value),
              contractAddress: 'native',
              chainId: this.crawlerConfig.chainId,
              timestamp: block.timestamp,
              blockNumber: block.number,
              fee: feeInNativeToken,
            });

            this.depositCrawlerMicroservice.emit<DepositEvent>(
              DEPOSIT_CRAWLER_EVENT,
              {
                key: `${this.crawlerConfig.chainId}-native`,
                value: JSON.stringify(depositEvent),
              },
            );
          }
        }

        currentBlock++;
        await this.redis.set(
          CRAWLER_CURRENT_BLOCK(this.crawlerConfig.chainId, 'native'),
          currentBlock.toString(),
        );
      } catch (error) {
        console.log({ error });
        this.logger.error(ctx, `Error crawling block ${currentBlock}`, error);
      } finally {
        clearInterval(interval);
      }
    }
  }
}
