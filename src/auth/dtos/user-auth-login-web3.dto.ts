import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UserLoginWeb3Input {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The address of the user',
  })
  address: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The signature of the user',
  })
  signature: string;
}
