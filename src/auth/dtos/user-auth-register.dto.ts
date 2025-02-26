import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';
import { UserStatus } from 'src/user/entities/user.entity';

export class UserRegisterInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(8, 16)
  @IsString()
  password: string;

  // Validate alias only include alphanumeric characters, underscores and hyphens (no spaces or special characters)
  @ApiProperty()
  @MinLength(8)
  @MaxLength(50)
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Alias must only include alphanumeric characters, underscores and hyphens',
  })
  // Alias not include profanity (using regex to check). Not include `porn`, `sex`, `xxx`, `fuck`, `bitch`, `cunt`
  @Matches(/^(?!.*(porn|sex|xxx|fuck|bitch|cunt)).*$/, {
    message: 'Alias must not include profanity',
  })
  alias: string;

  @ApiPropertyOptional({ description: 'Referral code', example: 'referral-code' })
  @IsOptional()
  @Expose()
  referralCode?: string;
}

export class UserRegisterOutput {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  alias: string;

  @Expose()
  @ApiProperty()
  status: UserStatus;

  @Expose()
  @ApiProperty()
  referralCode: string;

  @Expose()
  @ApiProperty()
  metadata: Record<string, any>;

  @Expose()
  @ApiProperty()
  createdAt: string;

  @Expose()
  @ApiProperty()
  updatedAt: string;
}
