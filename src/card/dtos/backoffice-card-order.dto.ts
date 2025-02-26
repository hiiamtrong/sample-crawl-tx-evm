import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsDate, IsEnum, IsOptional, IsString } from "class-validator";
import { CountryOutputDto } from "src/country/dtos/country.dto";
import { UserOutput } from "src/user/dtos/user-output.dto";

import { ECardOrderStatus } from "../entities/card-order.entity";
import { ECardPriceCurrency } from "../entities/card-user.entity";
import { CardUserOutputDto } from "./card-output.dto";


export class BackofficeCardOrderFilterDto {

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ECardOrderStatus)
  status?: ECardOrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  countryId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  from?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  to?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortOrder?: string;
}

export class BackofficeCardOrderOutputDto {
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
  @Type(() => UserOutput)
  user: UserOutput;

  @Expose()
  @ApiProperty()
  @IsString()
  rewardAmount: string;

  @Expose()
  @ApiProperty()
  @IsString()
  totalDiscountAmount: string;
}
