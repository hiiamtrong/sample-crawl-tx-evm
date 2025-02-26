import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { AssetTokenOutputDto } from 'src/asset-token/dtos/asset-token.dto';
import {
  AssetTransactionStatusEnum,
  AssetTransactionTypeEnum,
} from 'src/transaction/entities/asset-transaction.entity';
import { UserOutput } from 'src/user/dtos/user-output.dto';

export class BackofficeAssetTransactionFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Expose()
  @IsEnum(AssetTransactionTypeEnum)
  type: AssetTransactionTypeEnum.deposit | AssetTransactionTypeEnum.withdraw;

  @ApiPropertyOptional()
  @IsOptional()
  @Expose()
  @IsDateString()
  from: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Expose()
  @IsDateString()
  to: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Expose()
  @IsEnum(AssetTransactionStatusEnum)
  status: AssetTransactionStatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @Expose()
  @IsString()
  keyword: string;
}

export class BackofficeAssetTransactionOutputDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  type: AssetTransactionTypeEnum;

  @Expose()
  @ApiProperty()
  userId: string;

  @Expose()
  @ApiProperty()
  status: AssetTransactionStatusEnum;

  @Expose()
  @ApiProperty()
  amount: string;

  @Expose()
  @ApiProperty()
  tx: string;

  @Expose()
  @ApiProperty()
  networkFeeAmount: string;

  @Expose()
  @ApiProperty()
  finalAmount: string;

  @Expose()
  @ApiProperty()
  usdAmount: string;

  @Expose()
  @ApiProperty()
  from: string;

  @Expose()
  @ApiProperty()
  to: string;

  @Expose()
  @ApiProperty()
  @Type(() => AssetTokenOutputDto)
  assetToken: AssetTokenOutputDto;


  @Expose()
  @ApiProperty()
  @Type(() => UserOutput)
  user: UserOutput;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
