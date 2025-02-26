import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { AssetToken } from 'src/asset-token/entities/asset-token.entity';

export class WithdrawInputDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  assetTokenId: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  address: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  amount: string;
}


export class WithdrawOutputDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  assetTransactionId: string;
}

export class EstimateFeeInputDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  assetTokenId: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  amount: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  address: string;
}

export class EstimateFeeOutputDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  feeInUsd: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  feeInNativeToken: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  amountInUsd: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  finalUsdAmount: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  amountInToken: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  finalAmountInToken: string;
}


export class BlockchainWithdrawInputDto {
  address: string;
  assetToken: AssetToken;
  amount: string;
}
