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
export class BscEthCrawler extends BaseTokenErc20Crawler {
  constructor(
    @InjectRedis()
    redis: Redis,
    @Inject(BLOCKCHAIN_MICROSERVICE)
    depositCrawlerMicroservice: ClientProxy,
    readonly config: AppConfigService,
    blockchainService: BlockchainService,
    logger: AppLogger,
  ) {
    logger.setContext(BscEthCrawler.name);

    const crawlerConfig = new CrawlerTokenErc20Config(
      'src/crawler/abis/eth.json',
      config.bsc.ethStartBlock,
      config.bsc.ethAddress,
      config.bsc.decimals,
      config.bsc.ethDecimals,
      config.bsc.ethIncrementBlock,
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
