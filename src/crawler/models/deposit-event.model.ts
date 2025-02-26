export class DepositEvent {
  txHash: string;
  from: string;
  to: string;
  amount: string;
  contractAddress: string;
  chainId: string;
  timestamp: number;
  fee: string;
  blockNumber: number;

  constructor({
    txHash,
    from,
    to,
    amount,
    contractAddress,
    chainId,
    timestamp,
    blockNumber,
    fee,
  }: {
    txHash: string;
    from: string;
    to: string;
    amount: string;
    contractAddress: string;
    chainId: string;
    timestamp: number;
    blockNumber: number;
    fee?: string;
  }) {
    this.txHash = txHash;
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.contractAddress = contractAddress;
    this.chainId = chainId;
    this.timestamp = timestamp;
    this.blockNumber = blockNumber;
    this.fee = fee;
  }
}
