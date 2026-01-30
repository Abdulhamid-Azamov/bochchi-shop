import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CartsService } from './carts.service';
import { AddToCartDto } from './dto/createcart.dto';
import { UpdateCartItemDto } from './dto/updatecartitem.dto';

@Controller('carts')
@UseGuards(JwtAuthGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) { }

  @Get()
  getCart(@Request() req) {
    return this.cartsService.getOrcreateCart(req.user.id);
  }

  @Post('items')
  addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartsService.addTocart(req.user.id, addToCartDto);
  }

  @Patch('items/:id')
  updateCartItem(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartsService.updateCartItem(
      req.user.id,
      +id,
      updateCartItemDto,
    );
  }

  @Delete('items/:id')
  removeFromCart(@Request() req, @Param('id') id: string) {
    return this.cartsService.removeFromCart(req.user.id, +id);
  }


  @Delete()
  clearCart(@Request() req) {
    return this.cartsService.clearCart(req.user.id);
  }
}
