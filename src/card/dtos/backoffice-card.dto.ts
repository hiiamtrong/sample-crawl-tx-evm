import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { ECardType } from '../entities/card.entity';
import { ECardPriceCurrency } from '../entities/card-user.entity';
import { CardPriceDto } from './card-output.dto';

export class BackofficeCardOutputDto {
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

export class BackofficeUpdateCardPrice {
  @ApiProperty()
  @IsNumber()
  @Expose()
  price: number;

  @ApiProperty()
  @IsEnum(ECardPriceCurrency)
  @Expose()
  currency: ECardPriceCurrency;

  @ApiProperty()
  @IsString()
  @Expose()
  cardId: string;
}

export class BackofficeUpdateCardPriceInput {
  @ApiProperty({ type: [BackofficeUpdateCardPrice] })
  @ValidateNested({ each: true })
  @Type(() => BackofficeUpdateCardPrice)
  @Expose()
  cards: BackofficeUpdateCardPrice[];
}

export class BackofficeUpdateCardMaxOwned {
  @ApiProperty()
  @IsInt()
  @Expose()
  @Min(1)
  maxOwned: number;

  @ApiProperty()
  @IsString()
  @Expose()
  cardId: string;
}

export class BackofficeUpdateCardMaxOwnedInput {
  @ApiProperty({ type: [BackofficeUpdateCardMaxOwned] })
  @ValidateNested({ each: true })
  @Type(() => BackofficeUpdateCardMaxOwned)
  @Expose()
  cards: BackofficeUpdateCardMaxOwned[];
}

export class BackofficeUpdateCardNextCardDiscountPercent {
  @ApiProperty()
  @IsNumber()
  @Expose()
  @Min(0)
  @Max(100)
  nextCardDiscountPercent: number;

  @ApiProperty()
  @IsString()
  @Expose()
  cardId: string;
}

export class BackofficeUpdateCardNextCardDiscountPercentInput {
  @ApiProperty({ type: [BackofficeUpdateCardNextCardDiscountPercent] })
  @ValidateNested({ each: true })
  @Type(() => BackofficeUpdateCardNextCardDiscountPercent)
  @Expose()
  cards: BackofficeUpdateCardNextCardDiscountPercent[];
}

export class BackofficeUpdateCardEarningToken {
  @ApiProperty()
  @IsNumber()
  @Expose()
  earningToken: number;

  @ApiProperty()
  @IsString()
  @Expose()
  cardId: string;
}

export class BackofficeUpdateCardEarningTokenInput {
  @ApiProperty({ type: [BackofficeUpdateCardEarningToken] })
  @ValidateNested({ each: true })
  @Type(() => BackofficeUpdateCardEarningToken)
  @Expose()
  cards: BackofficeUpdateCardEarningToken[];
}
