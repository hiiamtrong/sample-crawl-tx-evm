export const BLOCKCHAIN_GROUP_ID = 'blockchain-microservice';

export const BLOCKCHAIN_MICROSERVICE = 'blockchain-microservice';

export const CRAWLER_CURRENT_BLOCK = (chain: string, tokenAddress: string) => {
  return `crawler:current_block:${chain}:${tokenAddress}`;
};

export const DEPOSIT_CRAWLER_EVENT = 'crawler.deposit_event';

export const DEPOSIT_CRAWLER_DEAD_LETTER_EVENT =
  'crawler.deposit_event.dead_letter';

export const WITHDRAW_EVENT = 'crawler.withdraw_event';

export const SCAN_WITHDRAW_EVENT = 'crawler.scan_withdraw_event';

export const SCAN_WITHDRAW_EVENT_DEAD_LETTER =
  'crawler.scan_withdraw_event.dead_letter';


export const SWEEP_EVENT = 'crawler.sweep_event';

export const SCAN_SWEEP_EVENT = 'crawler.scan_sweep_event';
export const SCAN_SWEEP_EVENT_DEAD_LETTER =
  'crawler.scan_sweep_event.dead_letter';


export const SCAN_SEND_FEE_EVENT = 'crawler.scan_send_fee_event';
export const SCAN_SEND_FEE_EVENT_DEAD_LETTER =
  'crawler.scan_send_fee_event.dead_letter';
