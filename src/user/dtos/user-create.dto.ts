import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { AuthProvider, UserStatus } from 'src/user/entities/user.entity';

export class CreateUserInput {
  @ApiProperty()
  @IsString()
  @IsEmail()
  @Expose()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(8, 16)
  @IsString()
  @Expose()
  password: string;

  @ApiProperty()
  @IsString()
  @Expose()
  alias?: string;

  @Expose()
  status?: UserStatus;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @Expose()
  address?: string;

  @Exclude()
  referralCode?: string;

  @Exclude()
  authProvider: AuthProvider;
}
