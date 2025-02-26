import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CountryFilterDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;
}

export class CountryOutputDto {
  @ApiProperty()
  @IsNumber()
  @Expose()
  id: number;

  @ApiProperty()
  @IsString()
  @Expose()
  name: string;

  @ApiProperty()
  @IsString()
  @Expose()
  iso2: string;

  @ApiProperty()
  @IsString()
  @Expose()
  iso3: string;

  @ApiProperty()
  @IsNumber()
  @Expose()
  numericCode: number;

  @ApiProperty()
  @IsBoolean()
  @Expose()
  blacklisted: boolean;
}
