import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { CardUserOutputDto } from 'src/card/dtos/card-output.dto';
import { ECardPriceCurrency } from 'src/card/entities/card-user.entity';

export class CardPurchaseInputDto {
  @Expose()
  @ApiProperty()
  @IsString()
  cardId: string;

  @Expose()
  @ApiProperty()
  @IsNumber()
  amount: number;
}

export class PurchaseCardInputDto {
  @Expose()
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  cartId?: string;

  @Expose()
  @ApiProperty({
    type: [CardPurchaseInputDto],
  })
  @Type(() => CardPurchaseInputDto)
  @IsArray()
  cards: CardPurchaseInputDto[];

  @Expose()
  @ApiProperty()
  @IsEnum(ECardPriceCurrency)
  currency: ECardPriceCurrency;

  @Expose()
  @ApiProperty()
  @IsNumber()
  countryId: number;
}

export class PurchaseCardOutputDto {
  @Expose()
  @ApiProperty()
  @IsString()
  orderId: string;
}

export class PurchaseCardEstimateOutputDto {
  @Expose()
  @ApiProperty()
  @IsNumber()
  totalPrice: number;

  @Expose()
  @ApiProperty()
  @Type(() => CardUserOutputDto)
  @IsArray()
  cards: CardUserOutputDto[];

  @Expose()
  @ApiProperty()
  @IsString()
  totalEarnedReward: string;

  @Expose()
  @ApiProperty()
  @IsString()
  totalDiscountAmount: string;
}
