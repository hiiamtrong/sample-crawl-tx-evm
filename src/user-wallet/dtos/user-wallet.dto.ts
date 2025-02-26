import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserWalletAssetTokenOutputDto {
  @ApiProperty({ example: '0x1234567890123456789012345678901234567890' })
  @IsString()
  @IsNotEmpty()
  @Expose()
  address: string;
}


export class UserWalletOutputDto extends UserWalletAssetTokenOutputDto {
  @ApiProperty({ example: 1 })
  @IsString()
  @IsNotEmpty()
  @Expose()
  userId: string;
}
