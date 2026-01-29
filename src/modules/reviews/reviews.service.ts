import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Review } from 'src/entities/review.entity';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/createreview.dto';


@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(userId: number, createReviewDto: CreateReviewDto) {
    const { productId, rating, comment } = createReviewDto;
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const review = this.reviewRepository.create({
      userId,
      productId,
      rating,
      comment,
    });

    return await this.reviewRepository.save(review);
  }

  async findByProduct(productId: number) {
    return await this.reviewRepository.find({
      where: { productId: productId },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async remove(userId: number, id: number) {
    const review = await this.reviewRepository.findOne({
      where: { id, userId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.reviewRepository.remove(review);
    return { message: 'Review deleted successfully' };
  }
}
