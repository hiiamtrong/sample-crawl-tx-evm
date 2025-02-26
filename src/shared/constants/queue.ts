import { ApiProperty } from '@nestjs/swagger';

export const QUEUE_SEND_MAIL = 'queue:send-mail';

export class DeadLetterMessage<T> {
  @ApiProperty()
  message: T;

  @ApiProperty()
  deadLetterReason: string;

  @ApiProperty()
  retryCount: number;
}
