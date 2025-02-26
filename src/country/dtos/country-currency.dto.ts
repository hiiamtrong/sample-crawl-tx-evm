import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class CountryCurrencyOutputDto {
  @IsString()
  @Expose()
  currency: string;
}
