import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UserLoginGoogleInput {
  @ApiProperty({ description: 'Google id token', example: 'google-id-token' })
  @Expose()
  @IsNotEmpty()
  idToken: string;

  @ApiPropertyOptional({ description: 'Referral code', example: 'referral-code' })
  @IsOptional()
  @Expose()
  referralCode?: string;
}
