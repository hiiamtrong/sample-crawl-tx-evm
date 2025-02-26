import { VaultAccount } from '@fireblocks/ts-sdk';
import { TransactionResponse } from '@fireblocks/ts-sdk/dist/models/transaction-response';

export const FIREBLOCKS_SDK = 'FIREBLOCKS_SDK';
export const FIREBLOCKS_MICROSERVICE = 'FIREBLOCKS_MICROSERVICE';

export const FIREBLOCKS_GROUP_ID = 'fireblocks-consumer';

export const FIREBLOCKS_EVENT_PATTERNS = {
  WEBHOOK_TRANSACTION: 'fireblocks.webhook.transaction',
  SWEEP_TRANSACTION: 'fireblocks.sweep.transaction',
};

export enum FIREBLOCKS_ENVIRONMENT {
  PRODUCTION = 'production',
  SANDBOX = 'sandbox',
}

export enum FIREBLOCKS_TRANSACTION_TYPE {
  TRANSACTION_CREATED = 'TRANSACTION_CREATED',
  TRANSACTION_STATUS_UPDATED = 'TRANSACTION_STATUS_UPDATED',
  TRANSACTION_APPROVAL_STATUS_UPDATED = 'TRANSACTION_APPROVAL_STATUS_UPDATED',
}

export interface FireblocksWebhookTransaction {
  data: TransactionResponse;
  timestamp: number;
  type: FIREBLOCKS_TRANSACTION_TYPE;
  tenantId: string;
}

export enum FIREBLOCKS_CUSTOM_TRANSACTION_TYPE {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  SWEEP = 'SWEEP',
  INTERNAL_TRANSFER = 'INTERNAL_TRANSFER',
  MASTER_ACCOUNT_TRANSFER = 'MASTER_ACCOUNT_TRANSFER',
}

export class FireblocksSweepMessage {
  userId: number;
  vault: VaultAccount;
  currency: string;
  network: string;
}
