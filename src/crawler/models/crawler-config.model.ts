import { NetworkEnum } from 'src/network/network.constant';

export class CrawlerTokenErc20Config {
  abiPath: string;
  startBlock: number;
  contractAddress: string;
  decimals: number;
  tokenDecimals: number;
  incrementBlock: number;
  chainId: string;
  network: NetworkEnum;

  constructor(
    abiPath: string,
    startBlock: number,
    contractAddress: string,
    decimals: number,
    tokenDecimals: number,
    incrementBlock: number,
    chainId: string,
    network: NetworkEnum,
  ) {
    this.abiPath = abiPath;
    this.startBlock = startBlock;
    this.contractAddress = contractAddress;
    this.decimals = decimals;
    this.tokenDecimals = tokenDecimals;
    this.incrementBlock = incrementBlock;
    this.chainId = chainId;
    this.network = network;
  }
}

export class CrawlerTokenNativeConfig {
  startBlock: number;
  chainId: string;
  decimals: number;
  network: NetworkEnum;

  constructor(
    startBlock: number,
    chainId: string,
    decimals: number,
    network: NetworkEnum,
  ) {
    this.startBlock = startBlock;
    this.chainId = chainId;
    this.decimals = decimals;
    this.network = network;
  }
}
