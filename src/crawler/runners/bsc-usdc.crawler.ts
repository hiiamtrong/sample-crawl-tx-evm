import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { BaseTokenErc20Crawler } from 'src/crawler/base-token-erc20.crawler';
import { CrawlerTokenErc20Config } from 'src/crawler/models/crawler-config.model';
import { NetworkEnum } from 'src/network/network.constant';
import { AppConfigService } from 'src/shared/configs/config.service';
import { BLOCKCHAIN_MICROSERVICE } from 'src/shared/constants/crawler';
import { AppLogger } from 'src/shared/logger/logger.service';

@Injectable()
export class BscUsdcCrawler extends BaseTokenErc20Crawler {
  constructor(
    @InjectRedis()
    redis: Redis,
    @Inject(BLOCKCHAIN_MICROSERVICE)
    depositCrawlerMicroservice: ClientProxy,
    readonly config: AppConfigService,
    logger: AppLogger,
    blockchainService: BlockchainService,
  ) {
    logger.setContext(BscUsdcCrawler.name);

    const crawlerConfig = new CrawlerTokenErc20Config(
      'src/crawler/abis/usdc.json',
      config.bsc.usdcStartBlock,
      config.bsc.usdcAddress,
      config.bsc.decimals,
      config.bsc.usdcDecimals,
      config.bsc.usdcIncrementBlock,
      config.bsc.chainId,
      NetworkEnum.BSC,
    );

    super(
      redis,
      depositCrawlerMicroservice,
      blockchainService,
      logger,
      crawlerConfig,
    );
  }

  async run() {
    await this.start();
  }
}
