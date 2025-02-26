import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class UpdateWithdrawalFeeRateDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  value: number;
}

export class UpdateReferralRewardPercentageDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  value: number;
}

export class UpdateFundHolderAccountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class UpdateMinSweepAmountUSD {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  value: number;
}

export class UpdateMinDepositAmountUsd {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  value: number;
}

export class UpdateMinWithdrawalAmountUsd {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  value: number;
}
