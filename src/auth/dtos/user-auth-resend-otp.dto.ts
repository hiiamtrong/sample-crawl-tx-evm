import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserAuthResendOtpInput {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsEmail()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Expose()
  readonly type: 'verify' | 'reset-password';
}

export class UserAuthResendOtpOutput {
  @ApiProperty()
  @IsBoolean()
  @Expose()
  success: boolean;
}
