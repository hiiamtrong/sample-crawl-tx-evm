import 'src/shared/utils/json';

import { NestFactory } from '@nestjs/core';
import { CrawlerModule } from 'src/crawler/crawler.module';
import { BscEthCrawler } from 'src/crawler/runners/bsc-eth.crawler';
import { BscUsdcCrawler } from 'src/crawler/runners/bsc-usdc.crawler';
import { BscUsdtCrawler } from 'src/crawler/runners/bsc-usdt.crawler';
import { EthNativeCrawler } from 'src/crawler/runners/eth-native.crawler';
import { EthUsdcCrawler } from 'src/crawler/runners/eth-usdc.crawler';
import { EthUsdtCrawler } from 'src/crawler/runners/eth-usdt.crawler';
import { PolygonEthCrawler } from 'src/crawler/runners/polygon-eth.crawler';
import { PolygonUsdcCrawler } from 'src/crawler/runners/polygon-usdc.crawler';
import { PolygonUsdtCrawler } from 'src/crawler/runners/polygon-usdt.crawler';
import { initializeTransactionalContext, StorageDriver } from 'typeorm-transactional';

async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });
  const app = await NestFactory.create(CrawlerModule);
  const polygonUsdtCrawler = app.get(PolygonUsdtCrawler);
  const polygonUsdcCrawler = app.get(PolygonUsdcCrawler);
  const polygonEthCrawler = app.get(PolygonEthCrawler);
  const ethUsdcCrawler = app.get(EthUsdcCrawler);
  const ethNativeCrawler = app.get(EthNativeCrawler);
  const ethUsdtCrawler = app.get(EthUsdtCrawler);
  const bscUsdtCrawler = app.get(BscUsdtCrawler);
  const bscUsdcCrawler = app.get(BscUsdcCrawler);
  const bscEthCrawler = app.get(BscEthCrawler);
  await Promise.all([
    polygonUsdtCrawler.run(),
    polygonUsdcCrawler.run(),
    polygonEthCrawler.run(),
    ethNativeCrawler.run(),
    ethUsdcCrawler.run(),
    ethUsdtCrawler.run(),
    bscUsdtCrawler.run(),
    bscUsdcCrawler.run(),
    bscEthCrawler.run(),
  ]);
}

bootstrap();
