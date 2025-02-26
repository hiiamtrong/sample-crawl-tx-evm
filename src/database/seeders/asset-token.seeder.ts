import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AssetToken,
  CurrencyEnum,
} from 'src/asset-token/entities/asset-token.entity';
import { NetworkEnum, NetworkTypeEnum } from 'src/network/network.constant';
import { Repository } from 'typeorm';

@Injectable()
export class AssetTokenSeeder {
  constructor(
    @InjectRepository(AssetToken)
    private readonly assetTokenRepository: Repository<AssetToken>,
  ) {}

  async seed() {
    const assetTokens = [
      {
        name: 'USDT',
        symbol: 'USDT',
        network: NetworkEnum.ETHEREUM,
        currency: CurrencyEnum.USDT,
        coingeckoId: 'tether',
        fireblocksId: 'USDT_B75VRLGX_ZRKX',
        chainId: '1',
        contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        networkType: NetworkTypeEnum.EVM,
        nativeTokenCoingeckoId: 'ethereum',
      },

      {
        name: 'USDC',
        symbol: 'USDC',
        network: NetworkEnum.ETHEREUM,
        currency: CurrencyEnum.USDC,
        coingeckoId: 'usd-coin',
        fireblocksId: 'USDC_B75VRLGX_E7EF',
        chainId: '1',
        contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        networkType: NetworkTypeEnum.EVM,
        nativeTokenCoingeckoId: 'ethereum',
      },

      {
        name: 'ETH',
        symbol: 'ETH',
        network: NetworkEnum.ETHEREUM,
        currency: CurrencyEnum.ETH,
        coingeckoId: 'ethereum',
        fireblocksId: 'ETH_B75VRLGX_E7EF',
        chainId: '11155111',
        contractAddress: 'native',
        networkType: NetworkTypeEnum.EVM,
        nativeTokenCoingeckoId: 'ethereum',
      },

      {
        name: 'USDT',
        symbol: 'USDT',
        network: NetworkEnum.POLYGON,
        currency: CurrencyEnum.USDT,
        coingeckoId: 'tether',
        fireblocksId: 'USDT_B6BMTT9T_TL8B',
        chainId: '80002',
        contractAddress: '0xfe793d7f2ac2ecb184d74dd7a128ffbda7f37134',
        networkType: NetworkTypeEnum.EVM,
        nativeTokenCoingeckoId: 'matic-network',
      },

      {
        name: 'USDC',
        symbol: 'USDC',
        network: NetworkEnum.POLYGON,
        currency: CurrencyEnum.USDC,
        coingeckoId: 'usd-coin',
        fireblocksId: 'USDC_B6BMTT9T_I8G8',
        chainId: '80002',
        contractAddress: '0xfe793d7f2ac2ecb184d74dd7a128ffbda7f37134',
        networkType: NetworkTypeEnum.EVM,
        nativeTokenCoingeckoId: 'matic-network',
      },

      {
        name: 'ETH',
        symbol: 'ETH',
        network: NetworkEnum.POLYGON,
        currency: CurrencyEnum.ETH,
        coingeckoId: 'ethereum',
        fireblocksId: 'ETH_B6BMTT9T_I8G8',
        chainId: '80002',
        contractAddress: '0xDe53aAC035821A6F86948A67f5251822E2Cc32E5',
        networkType: NetworkTypeEnum.EVM,
        nativeTokenCoingeckoId: 'matic-network',
      },

      {
        name: 'USDT',
        symbol: 'USDT',
        network: NetworkEnum.BSC,
        currency: CurrencyEnum.USDT,
        coingeckoId: 'tether',
        fireblocksId: 'USDT_BSC_TEST_4HC4',
        chainId: '97',
        contractAddress: '0x3922CcEbfe053655a3E05Dd392733b1f326124d8',
        networkType: NetworkTypeEnum.EVM,
        nativeTokenCoingeckoId: 'binancecoin',
      },

      {
        name: 'USDC',
        symbol: 'USDC',
        network: NetworkEnum.BSC,
        currency: CurrencyEnum.USDC,
        coingeckoId: 'usd-coin',
        fireblocksId: 'USDC_B6FMGL4Y_HJ7I',
        chainId: '97',
        contractAddress: '0xfe793D7f2Ac2ECB184d74dd7a128fFbda7f37134',
        networkType: NetworkTypeEnum.EVM,
        nativeTokenCoingeckoId: 'binancecoin',
      },

      {
        name: 'ETH',
        symbol: 'ETH',
        network: NetworkEnum.BSC,
        currency: CurrencyEnum.ETH,
        coingeckoId: 'ethereum',
        fireblocksId: 'ETH_BSC_TEST_4HC4',
        chainId: '97',
        contractAddress: '0x39a98f9C9E02E17fd2baAf1E484bce5aaa0169c3',
        networkType: NetworkTypeEnum.EVM,
        nativeTokenCoingeckoId: 'binancecoin',
      },
    ];

    for (const assetToken of assetTokens) {
      const existingAssetToken = await this.assetTokenRepository.findOne({
        where: {
          currency: assetToken.currency,
          network: assetToken.network,
        },
      });

      if (existingAssetToken) {
        continue;
      }

      const newAssetToken = this.assetTokenRepository.create(assetToken);
      await this.assetTokenRepository.save(newAssetToken);
    }
  }
}
