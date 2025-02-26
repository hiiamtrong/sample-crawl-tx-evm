import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { SystemConfigKey } from 'src/system-config/entities/system-config.entity';

export class CreateSystemConfigDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(SystemConfigKey)
  key: SystemConfigKey;

  @ApiProperty()
  @IsObject()
  @IsNotEmpty()
  value: Record<string, any>;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}
