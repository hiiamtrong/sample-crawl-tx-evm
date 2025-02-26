import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class OperatorForgotPasswordInput {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  email: string;
}

export class OperatorForgotPasswordOutput {
  @ApiProperty()
  @IsBoolean()
  @Expose()
  success: boolean;
}
