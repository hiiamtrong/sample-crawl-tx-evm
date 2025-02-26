import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserChangePasswordInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class UserChangePasswordOutput {
  @ApiProperty()
  @IsBoolean()
  @Expose()
  success: boolean;
}
