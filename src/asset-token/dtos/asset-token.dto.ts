import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { CurrencyEnum } from 'src/asset-token/entities/asset-token.entity';
import { NetworkEnum } from 'src/network/network.constant';

export class AssetTokenOutputDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  symbol: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  network: NetworkEnum;

  @Expose()
  @ApiProperty()
  currency: CurrencyEnum;

  @Expose()
  @ApiProperty()
  coingeckoId: string;

  @Expose()
  @ApiProperty()
  fireblocksId: string;
}
