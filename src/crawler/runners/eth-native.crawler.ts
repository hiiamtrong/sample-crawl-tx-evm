import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { BaseTokenNativeCrawler } from 'src/crawler/base-token-native.crawler';
import { CrawlerTokenNativeConfig } from 'src/crawler/models/crawler-config.model';
import { NetworkEnum } from 'src/network/network.constant';
import { AppConfigService } from 'src/shared/configs/config.service';
import { BLOCKCHAIN_MICROSERVICE } from 'src/shared/constants/crawler';
import { AppLogger } from 'src/shared/logger/logger.service';

@Injectable()
export class EthNativeCrawler extends BaseTokenNativeCrawler {
  constructor(
    @InjectRedis()
    redis: Redis,
    @Inject(BLOCKCHAIN_MICROSERVICE)
    depositCrawlerMicroservice: ClientProxy,
    blockchainService: BlockchainService,
    readonly config: AppConfigService,
    logger: AppLogger,
  ) {
    logger.setContext(EthNativeCrawler.name);

    const crawlerConfig = new CrawlerTokenNativeConfig(
      config.ethereum.ethStartBlock,
      config.ethereum.chainId,
      config.ethereum.decimals,
      NetworkEnum.ETHEREUM,
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
