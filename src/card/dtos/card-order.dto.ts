import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsString } from 'class-validator';
import { CardUserOutputDto } from 'src/card/dtos/card-output.dto';
import { ECardPriceCurrency } from 'src/card/entities/card-user.entity';
import { CountryOutputDto } from 'src/country/dtos/country.dto';

import { ECardOrderStatus } from '../entities/card-order.entity';

export class CardOrderOutputDto {
  @Expose()
  @ApiProperty()
  @IsString()
  id: string;

  @Expose()
  @ApiProperty()
  @IsEnum(ECardOrderStatus)
  status: ECardOrderStatus;

  @Expose()
  @ApiProperty()
  @IsString()
  totalPrice: string;

  @Expose()
  @ApiProperty()
  @IsString()
  cardPriceCurrency: ECardPriceCurrency;

  @Expose()
  @ApiProperty()
  @IsString()
  purchaseDate: Date;

  @Expose()
  @ApiProperty()
  @IsString()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  @IsString()
  updatedAt: Date;

  @Expose()
  @ApiProperty()
  @Type(() => CardUserOutputDto)
  cardUsers: CardUserOutputDto[];

  @Expose()
  @ApiProperty()
  @Type(() => CountryOutputDto)
  country: CountryOutputDto;

  @Expose()
  @ApiProperty()
  @IsString()
  rewardAmount: string;

  @Expose()
  @ApiProperty()
  @IsString()
  totalDiscountAmount: string;
}
