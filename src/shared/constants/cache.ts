import { NetworkEnum } from 'src/network/network.constant';

export const CACHE_KEY_PHONE_OTP = 'phone-otp';
export const CACHE_KEY_EMAIL_OTP = (type: string) => `email-otp-${type}`;
export const ESTIMATE_GAS_FEE_CACHE_KEY = (network: NetworkEnum) =>
  `estimate-gas-fee-${network}`;

export const RPC_URL_INDEXES = (network: NetworkEnum) =>
  `rpc-url-indexes-${network}`;

export const WRITE_RPC_URL_INDEXES = (network: NetworkEnum) =>
  `write-rpc-url-indexes-${network}`;
