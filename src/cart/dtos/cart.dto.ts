import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsPositive, IsString, Min, ValidateNested } from 'class-validator';
import { CardOutputDto } from 'src/card/dtos/card-output.dto';
import { CountryOutputDto } from 'src/country/dtos/country.dto';

export class CartItemInputDto {
  @ApiProperty()
  @IsString()
  @Expose()
  cardId: string;

  @ApiProperty()
  @IsNumber()
  @Expose()
  @IsPositive()
  amount: number;
}

export class AddToCartInputDto {
  @ApiProperty({ type: [CartItemInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemInputDto)
  @Expose()
  items: CartItemInputDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Expose()
  countryId?: number;
}

export class CartItemOutputDto {
  @ApiProperty()
  @IsString()
  @Expose()
  id: string;

  @ApiProperty()
  @IsString()
  @Expose()
  cardId: string;

  @ApiProperty()
  @IsNumber()
  @Expose()
  amount: number;

  @ApiProperty()
  @Expose()
  @Type(() => CardOutputDto)
  card: CardOutputDto;
}

export class CartOutputDto {
  @ApiProperty()
  @IsString()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty({ type: [CartItemOutputDto] })
  @Expose()
  @Type(() => CartItemOutputDto)
  items: CartItemOutputDto[];

  @ApiProperty()
  @Expose()
  countryId: number;

  @ApiProperty()
  @Expose()
  @Type(() => CountryOutputDto)
  country: CountryOutputDto;
}


export class UpdateAmountInputDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Expose()
  amount: number;

  @ApiProperty()
  @IsString()
  @Expose()
  cartItemId: string;
}
