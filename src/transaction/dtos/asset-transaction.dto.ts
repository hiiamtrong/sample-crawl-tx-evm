import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { AssetTokenOutputDto } from 'src/asset-token/dtos/asset-token.dto';
import {
  AssetTransactionStatusEnum,
  AssetTransactionTypeEnum,
} from 'src/transaction/entities/asset-transaction.entity';

export class AssetTransactionFilterDto {
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
}

export class AssetTransactionOutputDto {
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
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
