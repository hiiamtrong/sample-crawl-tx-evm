import { Global, Module } from "@nestjs/common";
import { TelegramBotService } from "src/telegrambot/telegram-bot.service";


@Global()
@Module({
  imports: [],
  providers: [TelegramBotService],
  exports: [TelegramBotService],
})
export class TelegramBotModule { }
