import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { CountryOutputDto } from 'src/country/dtos/country.dto';
import { AuthProvider, UserStatus } from 'src/user/entities/user.entity';

export class UserOutput {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  alias: string;

  @Expose()
  @ApiProperty()
  isHidden: boolean;

  @Expose()
  @ApiPropertyOptional()
  tempEmail?: string;

  @Expose()
  @ApiProperty()
  address: string;

  @Expose()
  @ApiProperty()
  referralCode: string;

  @Expose()
  @ApiProperty()
  status: UserStatus;

  @Expose()
  @ApiProperty()
  metadata: Record<string, any>;

  @Expose()
  @ApiPropertyOptional()
  @IsOptional()
  countryId: string;

  @Expose()
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => CountryOutputDto)
  country: CountryOutputDto;

  @Expose()
  @ApiProperty()
  disabledRedeem: boolean;

  @Expose()
  @ApiProperty()
  disabledPurchase: boolean;

  @Expose()
  @ApiProperty()
  authProvider: AuthProvider;

  @Expose()
  @ApiProperty()
  firstLogin: boolean;

  @Expose()
  @ApiProperty()
  createdAt: string;

  @Expose()
  @ApiProperty()
  updatedAt: string;
}

export class BackofficeUserOutput extends UserOutput {
  @Expose()
  @ApiProperty()
  numberOfCards: number;
}


export class UserReferralCodeOutput {
  @Expose()
  @ApiProperty()
  referralCode: string;

  @Expose()
  @ApiProperty()
  rewardAmount: string;

  @Expose()
  @ApiProperty()
  referralCount: number;
}
