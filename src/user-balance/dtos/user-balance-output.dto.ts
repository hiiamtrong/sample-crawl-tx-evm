import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class UserBalanceOutput {
  @ApiProperty()
  @Expose()
  @IsString()
  userId: string;

  @ApiProperty()
  @Expose()
  @IsString()
  amount: string;

  @ApiProperty()
  @Expose()
  @IsString()
  lockedAmount: string;
}
