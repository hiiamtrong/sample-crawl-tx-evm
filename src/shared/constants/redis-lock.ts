export const USER_BALANCE_LOCK_KEY = (userId: string) =>
  `user_balance:${userId}`;

export const REWARD_LOCK_KEY = (userId: string) => `reward:${userId}`;

export const TOKEN_PRICE_LOCK_KEY = (tokenId: string) => `token_price:${tokenId}`;
