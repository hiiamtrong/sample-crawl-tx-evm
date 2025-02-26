import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  ECardPriceCurrency,
  ECardUserStatus,
} from 'src/card/entities/card-user.entity';

import { ECardType, ICardPrice } from '../entities/card.entity';

export class CardPriceDto implements ICardPrice {
  @ApiProperty()
  @IsEnum(ECardPriceCurrency)
  @Expose()
  currency: ECardPriceCurrency;

  @ApiProperty()
  @IsNumber()
  @Expose()
  amount: number;
}

export class CardOutputDto {
  @ApiProperty()
  @IsString()
  @Expose()
  id: string;

  @ApiProperty()
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({ enum: ECardType })
  @IsEnum(ECardType)
  @Expose()
  type: ECardType;

  @ApiProperty()
  @IsString()
  @Expose()
  subType: string;

  @ApiProperty()
  @IsObject()
  @Expose()
  metadata: Record<string, any>;

  @ApiProperty({ type: [CardPriceDto] })
  @ValidateNested({ each: true })
  @Type(() => CardPriceDto)
  @Expose()
  price: CardPriceDto[];

  @ApiProperty()
  @IsNumber()
  @Expose()
  maxOwned: number;

  @ApiProperty()
  @IsNumber()
  @Expose()
  earningToken: number;

  @ApiProperty()
  @IsNumber()
  @Expose()
  nextCardDiscountPercent: number;
}

export class CardUserOutputDto {
  @ApiProperty()
  @IsString()
  @Expose()
  id: string;

  @ApiProperty()
  @IsString()
  @Expose()
  cardOrderId: string;

  @ApiProperty({ enum: ECardUserStatus })
  @IsEnum(ECardUserStatus)
  @Expose()
  status: ECardUserStatus;

  @ApiProperty()
  @IsNumber()
  @Expose()
  discountPercent: number;

  @ApiProperty()
  @IsString()
  @Expose()
  redeemCode: string;

  @ApiProperty()
  @IsString()
  @Expose()
  redeemedDate: string;

  @ApiProperty()
  @IsString()
  @Expose()
  purchasePrice: string;

  @ApiProperty()
  @IsString()
  @Expose()
  cardPriceCurrency: ECardPriceCurrency;

  @ApiProperty()
  @IsString()
  @Expose()
  purchaseDate: string;

  @ApiProperty()
  @IsNumber()
  @Expose()
  cardOrderNumber: number;

  @ApiProperty()
  @Expose()
  @Type(() => CardOutputDto)
  card: CardOutputDto;

  @ApiProperty()
  @IsString()
  @Expose()
  rewardAmount: string;
}

export class CountByCardOutputDto {
  @ApiProperty()
  @IsString()
  @Expose()
  cardId: string;

  @ApiProperty()
  @IsNumber()
  @Expose()
  owned: number;
}
