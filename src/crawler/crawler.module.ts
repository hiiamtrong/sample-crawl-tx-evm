import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { BscEthCrawler } from 'src/crawler/runners/bsc-eth.crawler';
import { BscUsdcCrawler } from 'src/crawler/runners/bsc-usdc.crawler';
import { BscUsdtCrawler } from 'src/crawler/runners/bsc-usdt.crawler';
import { EthNativeCrawler } from 'src/crawler/runners/eth-native.crawler';
import { EthUsdcCrawler } from 'src/crawler/runners/eth-usdc.crawler';
import { EthUsdtCrawler } from 'src/crawler/runners/eth-usdt.crawler';
import { PolygonEthCrawler } from 'src/crawler/runners/polygon-eth.crawler';
import { PolygonUsdcCrawler } from 'src/crawler/runners/polygon-usdc.crawler';
import { PolygonUsdtCrawler } from 'src/crawler/runners/polygon-usdt.crawler';
import { AppConfigService } from 'src/shared/configs/config.service';
import {
  BLOCKCHAIN_GROUP_ID,
  BLOCKCHAIN_MICROSERVICE,
} from 'src/shared/constants/crawler';
import { SharedModule } from 'src/shared/shared.module';
import { getKafkaConfig } from 'src/shared/utils/kafka';

@Module({
  imports: [
    SharedModule,
    ClientsModule.registerAsync({
      clients: [
        {
          name: BLOCKCHAIN_MICROSERVICE,
          useFactory: (config: AppConfigService) => {
            return {
              transport: Transport.KAFKA,
              options: {
                client: getKafkaConfig(config),
                consumer: {
                  groupId: BLOCKCHAIN_GROUP_ID,
                },
              },
            };
          },
          inject: [AppConfigService],
        },
      ],
    }),
    BlockchainModule,
  ],
  providers: [
    PolygonUsdtCrawler,
    PolygonUsdcCrawler,
    PolygonEthCrawler,
    EthUsdcCrawler,
    EthUsdtCrawler,
    EthNativeCrawler,
    BscEthCrawler,
    BscUsdtCrawler,
    BscUsdcCrawler,
  ],
})
export class CrawlerModule {}
