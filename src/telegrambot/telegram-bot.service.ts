import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { AppConfigService } from 'src/shared/configs/config.service';

@Injectable()
export class TelegramBotService {
  bot: TelegramBot;
  constructor(
    private readonly config: AppConfigService
  ) {
    this.bot = new TelegramBot(this.config.telegram.botToken, { polling: false });
  }

  async sendMessage(chatId: string, message: string) {
    return this.bot.sendMessage(chatId, message);
  }
}
