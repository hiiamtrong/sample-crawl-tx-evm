import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardRepository } from 'src/card/repositories/card.repository';
import { Country } from 'src/country/entities/country.entity';

import { CartController } from './controllers/cart.controller';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CartService } from './services/cart.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, Country])],
  controllers: [CartController],
  providers: [CartService, CardRepository],
  exports: [CartService],
})
export class CartModule { } 
