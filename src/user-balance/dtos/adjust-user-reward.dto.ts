import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AdjustUserRewardDto {
  @ApiProperty({
    description: 'User ID whose reward will be adjusted',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Amount to adjust (positive for increase, negative for decrease)',
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

} 
