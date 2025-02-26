import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsString } from 'class-validator';
import { NetworkEnum } from 'src/network/network.constant';

export class SystemConfigOutputDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  key: string;

  @Expose()
  @ApiProperty()
  value: Record<string, any>;

  @Expose()
  @ApiPropertyOptional()
  description?: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}

export class SystemConfigFundHolderAccountOutputDto {
  @ApiProperty()
  @IsEnum(NetworkEnum)
  @Expose()
  network: NetworkEnum;

  @ApiProperty()
  @IsString()
  @Expose()
  address: string;
}
