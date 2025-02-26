import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, Matches, MaxLength, MinLength } from "class-validator";

export class AddReferralInput {
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  referralCode: string;
}


export class UpdateAliasInput {
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Alias must only include alphanumeric characters, underscores and hyphens',
  })
  @Matches(/^(?!.*(porn|sex|xxx|fuck|bitch|cunt)).*$/, {
    message: 'Alias must not include profanity',
  })
  alias: string;
}
