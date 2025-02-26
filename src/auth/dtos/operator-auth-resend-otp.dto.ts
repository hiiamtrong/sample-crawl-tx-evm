import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class OperatorAuthResendOtpInput {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @IsEmail()
  @Expose()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Expose()
  readonly type: 'verify' | 'reset-password';
}

export class OperatorAuthResendOtpOutput {
  @ApiProperty()
  @IsBoolean()
  @Expose()
  success: boolean;
}
