import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

import { CountryFilterDto, CountryOutputDto } from './country.dto';

export class BackofficeCountryFilterDto extends CountryFilterDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  blacklisted?: boolean;
}

export class BackofficeCountryOutputDto extends CountryOutputDto {}
