import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserLoginInput {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  @IsEmail()
  @Expose()
  email: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  @Expose()
  password: string;
}
