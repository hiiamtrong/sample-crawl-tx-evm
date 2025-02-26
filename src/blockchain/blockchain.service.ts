import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { ethers } from 'ethers';
import * as fs from 'fs';
import { Redis } from 'ioredis';
import { AssetToken, CurrencyEnum } from 'src/asset-token/entities/asset-token.entity';
import { NetworkEnum } from 'src/network/network.constant';
import { AppConfigService } from 'src/shared/configs/config.service';
import { RPC_URL_INDEXES, WRITE_RPC_URL_INDEXES } from 'src/shared/constants/cache';
import {
  AppExceptionCode,
  getAppException,
} from 'src/shared/exceptions/app.exception';
import { AppLogger } from 'src/shared/logger/logger.service';
import { RequestContext } from 'src/shared/request-context/request-context.dto';

@Injectable()
export class BlockchainService {
  constructor(
    private readonly config: AppConfigService,
    @InjectRedis()
    private readonly redis: Redis,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(BlockchainService.name);
  }

  async getProvider(ctx: RequestContext, network: NetworkEnum) {
    let rpcUrls;
    switch (network) {
      case NetworkEnum.BSC:
        rpcUrls = this.config.bsc.rpcUrls;
        break;
      case NetworkEnum.ETHEREUM:
        rpcUrls = this.config.ethereum.rpcUrls;
        break;
      case NetworkEnum.POLYGON:
        rpcUrls = this.config.polygon.rpcUrls;
        break;
      default:
        throw getAppException(AppExceptionCode.NETWORK_NOT_FOUND);
    }
    const rpcUrlIndices = await this.redis.get(RPC_URL_INDEXES(network));

    const index = rpcUrlIndices ? parseInt(rpcUrlIndices) : 0;

    const rpcUrl = rpcUrls[index];
    const nextIndex = (index + 1) % rpcUrls.length;

    await this.redis.set(RPC_URL_INDEXES(network), nextIndex.toString());

    this.logger.log(ctx, `Using RPC URL: ${rpcUrl}`);

    return new ethers.JsonRpcProvider(rpcUrl);
  }

  async getWriteProvider(ctx: RequestContext, network: NetworkEnum) {
    let writeRpcUrls
    switch (network) {
      case NetworkEnum.BSC:
        writeRpcUrls = this.config.bsc.writeRpcUrls;
        break;
      case NetworkEnum.ETHEREUM:
        writeRpcUrls = this.config.ethereum.writeRpcUrls;
        break;
      case NetworkEnum.POLYGON:
        writeRpcUrls = this.config.polygon.writeRpcUrls;
        break;
      default:
        throw getAppException(AppExceptionCode.NETWORK_NOT_FOUND);
    }

    const writeRpcUrlIndices = await this.redis.get(WRITE_RPC_URL_INDEXES(network));
    const index = writeRpcUrlIndices ? parseInt(writeRpcUrlIndices) : 0;

    const writeRpcUrl = writeRpcUrls[index];
    const nextIndex = (index + 1) % writeRpcUrls.length;

    await this.redis.set(WRITE_RPC_URL_INDEXES(network), nextIndex.toString());

    this.logger.log(ctx, `Using write RPC URL: ${writeRpcUrl}`);

    return new ethers.JsonRpcProvider(writeRpcUrl);
  }

  async getTokenAbi(currency: CurrencyEnum,) {
    let abiPath;
    switch (currency) {
      case CurrencyEnum.USDT:
        abiPath = 'src/crawler/abis/usdt.json';
        break;
      case CurrencyEnum.USDC:
        abiPath = 'src/crawler/abis/usdc.json';
        break;
      case CurrencyEnum.ETH:
        abiPath = 'src/crawler/abis/eth.json';
        break;
    }

    const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

    return abi;
  }

  async getTokenBalance(ctx: RequestContext, address: string, assetToken: AssetToken) {
    if (assetToken.contractAddress == 'native') {
      return await this.getNativeBalance(ctx, address, assetToken);
    }

    const provider = await this.getProvider(ctx, assetToken.network);

    const abi = await this.getTokenAbi(assetToken.currency);

    const contract = new ethers.Contract(assetToken.contractAddress, abi, provider);

    const balance = await contract.balanceOf(address)
    const balanceInToken = ethers.formatUnits(balance, assetToken.decimals);
    return balanceInToken;
  }

  async getNativeBalance(ctx: RequestContext, address: string, assetToken: AssetToken) {
    const provider = await this.getProvider(ctx, assetToken.network);

    const balance = await provider.getBalance(address);

    const balanceInEth = ethers.formatUnits(balance, assetToken.decimals);
    return balanceInEth;
  }
}
