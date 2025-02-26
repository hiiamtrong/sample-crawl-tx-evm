import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ECardPriceCurrency } from 'src/card/entities/card-user.entity';
import { Repository } from 'typeorm';

import { Card, ECardType } from '../../card/entities/card.entity';

@Injectable()
export class CardSeeder {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
  ) { }

  async seed() {
    const cards = [
      {
        type: ECardType.PLASTIC,
        name: 'Crimson Card',
        subType: 'crimson',
        metadata: {
          color: 'blue',
          design: 'wave',
          initialFee: 10,
          annualFee: 10,
          monthlySpendLimit: 100000,
          transactionLimit: 100000,
          cashbackPercent: 0.5,
          feePercent: 2.1,
          weight: 100,
        },
        price: [{ currency: ECardPriceCurrency.USD, amount: 10 }],
        maxOwned: 5,
        earningToken: 100,
        nextCardDiscountPercent: 5,
      },
      {
        type: ECardType.METAL,
        name: 'Silver Card',
        subType: 'silver',
        metadata: {
          color: 'silver',
          design: 'premium',
          initialFee: 10,
          annualFee: 10,
          monthlySpendLimit: 100000,
          transactionLimit: 100000,
          cashbackPercent: 0.5,
          feePercent: 2.1,
          weight: 100,
        },
        price: [{ currency: ECardPriceCurrency.USD, amount: 50 }],
        maxOwned: 5,
        earningToken: 100,
        nextCardDiscountPercent: 5,
      },

      {
        type: ECardType.METAL,
        name: 'Black Card',
        subType: 'black',
        metadata: {
          color: 'black',
          design: 'premium',
          initialFee: 10,
          annualFee: 10,
          monthlySpendLimit: 100000,
          transactionLimit: 100000,
          cashbackPercent: 0.5,
          feePercent: 2.1,
          weight: 100,
        },
        price: [{ currency: ECardPriceCurrency.USD, amount: 100 }],
        maxOwned: 5,
        earningToken: 100,
        nextCardDiscountPercent: 5,
      },
    ];

    for (const cardData of cards) {
      const existCard = await this.cardRepository.findOne({
        where: {
          name: cardData.name,
          type: cardData.type,
          subType: cardData.subType,
        },
      });

      if (existCard) {
        continue;
      }

      const card = this.cardRepository.create(cardData);
      await this.cardRepository.save(card);
    }
  }
}
