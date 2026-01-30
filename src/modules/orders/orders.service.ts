import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem } from 'src/entities/cart-item.entity';
import { Cart } from 'src/entities/cart.entity';
import { OrderItem } from 'src/entities/order-item.entity';
import { Order, OrderStatus } from 'src/entities/order.entity';
import { Product } from 'src/entities/product.entity';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';


@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
  ) { }

  async createOrder(userId: number, createOrderDto: CreateOrderDto) {
    const { cartId } = createOrderDto;

    const cart = await this.cartRepository.findOne({
      where: { id: cartId, userId },
      relations: ['cartItems', 'cartItems.product'],
    });

    if (!cart || cart.cartItems.length === 0) {
      throw new BadRequestException('Cart is Empty');
    }

    let total = 0;
    const orderItems: Partial<OrderItem>[] = [];

    for (const cartItem of cart.cartItems) {
      const product = cartItem.product;

      if (product.stock < cartItem.quantity) {
        `Insufficient stock for: ${product.title}`;
      }

      total += Number(product.price) * cartItem.quantity;

      orderItems.push({
        productId: product.id,
        quantity: cartItem.quantity,
        price: product.price,
      });

      product.stock -= cartItem.quantity;
      await this.productRepository.save(product);
    }

    const order = this.orderRepository.create({
      userId,
      total,
      status: OrderStatus.PENDING,
    });
    await this.orderRepository.save(order);

    for (const item of orderItems) {
      const orderItem = this.orderItemRepository.create({
        orderId: order.id,
        ...item,
      });
      await this.orderItemRepository.save(orderItem);
    }

    await this.cartItemRepository.delete({ cartId });

    return await this.findOne(order.id);
  }

  async findAll(userId: number) {
    return await this.orderRepository.find({
      where: { userId },
      relations: ['orderItems', 'orderItems.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems', 'orderItems.product', 'payment'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);
    order.status = updateOrderStatusDto.status;
    return await this.orderRepository.save(order);
  }
}
