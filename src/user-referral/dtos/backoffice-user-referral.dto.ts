import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class BackofficeUserReferralFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keyword?: string;
}

export class BackofficeUserReferralOutputDto {
  @ApiProperty()
  @Expose()
  userId: string;

  @ApiProperty()
  @Expose()
  userEmail: string;

  @ApiProperty()
  @Expose()
  referredByEmail: string;

  @ApiProperty()
  @Expose()
  totalRewardAmount: string;

  @ApiProperty()
  @Expose()
  totalReferrals: number;

  @ApiProperty()
  @Expose()
  currentRewardAmount: string;
}


export class BackofficeUserReferralStatsDto {
  @ApiProperty()
  @Expose()
  totalReferrals: number;

  @ApiProperty()
  @Expose()
  totalRewardAmount: string;

  @ApiProperty()
  @Expose()
  totalDepositAmount: string;
}
