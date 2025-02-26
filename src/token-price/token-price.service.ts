import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import axios from 'axios';
import Redis from 'ioredis';
import { TOKEN_PRICE_LOCK_KEY } from 'src/shared/constants/redis-lock';
import { AppLogger } from 'src/shared/logger/logger.service';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { RedisLockService } from 'src/shared/services/redis-lock.service';

@Injectable()
export class TokenPriceService {
  private readonly COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
  private readonly CACHE_TTL = 60;
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly logger: AppLogger,
    private readonly redisLockService: RedisLockService,
  ) {
    this.logger.setContext(TokenPriceService.name);
  }

  async getTokenPriceInUSD(
    ctx: RequestContext,
    tokenId: string,
  ): Promise<number> {
    const cachedPrice = await this.getCachedPrice(tokenId);
    if (cachedPrice) {
      return cachedPrice;
    }
    try {
      return await this.redisLockService.withLock(TOKEN_PRICE_LOCK_KEY(tokenId), async () => {
        const response = await axios.get(
          `${this.COINGECKO_API_URL}/simple/price`,
          {
            params: {
              ids: tokenId,
              vs_currencies: 'usd',
            },
          },
        );

        const price = response.data[tokenId].usd;
        await this.cachePrice(tokenId, price);
        return price;
      });
    } catch (error) {
      this.logger.error(ctx, `Failed to fetch price for token ${tokenId}`, {
        error,
      });
      throw new Error(`Failed to fetch price for token ${tokenId}`);
    }
  }

  private async getCachedPrice(tokenId: string): Promise<number | null> {
    const cachedPrice = await this.redis.get(`token_price:${tokenId}`);
    return cachedPrice ? parseFloat(cachedPrice) : null;
  }

  private async cachePrice(tokenId: string, price: number): Promise<void> {
    await this.redis.set(
      `token_price:${tokenId}`,
      price.toString(),
      'EX',
      this.CACHE_TTL,
    );
  }
}
