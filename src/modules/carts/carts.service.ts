import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem } from 'src/entities/cart-item.entity';
import { Cart } from 'src/entities/cart.entity';
import { Product } from 'src/entities/product.entity';
import { Repository } from 'typeorm';
import { AddToCartDto } from './dto/createcart.dto';
import { UpdateCartItemDto } from './dto/updatecartitem.dto';
import { successRes } from '../utils/success-res';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) { }

  async getOrcreateCart(userId: number) {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['cartItems', 'cartItems.product'],
    });

    if (!cart) {
      const cart = this.cartRepository.create({ userId });
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  async addTocart(userId: number, addToCartDto: AddToCartDto) {
    const { productId, quantity } = addToCartDto;

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const cart = await this.getOrcreateCart(userId);
    if (!cart) {
      throw new NotFoundException('User not found');
    }

    let cartItem = await this.cartItemRepository.findOne({
      where: {
        cart: { id: cart.id },
        product: { id: productId },
      },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        quantity,
      });
    }

    await this.cartItemRepository.save(cartItem);

    return await this.getOrcreateCart(userId);
  }

  async updateCartItem(
    userId: number,
    itemId: number,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    const cart = await this.getOrcreateCart(userId);
    if (!cart) {
      throw new NotFoundException('User not found');
    }

    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    cartItem.quantity = updateCartItemDto.quantity;
    await this.cartItemRepository.save(cartItem);

    return await this.getOrcreateCart(userId);
  }

  async removeFromCart(userId: number, itemId: number) {
    const cart = await this.getOrcreateCart(userId);
    if (!cart) {
      throw new NotFoundException('User not found');
    }

    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.remove(cartItem);

    return await this.getOrcreateCart(userId);
  }

  async clearCart(userId: number) {
    const cart = await this.getOrcreateCart(userId);
    if (!cart) {
      throw new NotFoundException('User not found');
    }
    await this.cartItemRepository.delete({ cartId: cart.id });
    return successRes({});
  }
}
