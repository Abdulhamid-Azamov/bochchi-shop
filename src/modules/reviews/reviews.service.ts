import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Review } from 'src/entities/review.entity';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/createreview.dto';
import { successRes } from '../utils/success-res';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) { }

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

    await this.reviewRepository.save(review);
    return successRes(review,'Review created',201);
  }

  async findByProduct(productId: number) {
    const review = await this.reviewRepository.find({
      where: { productId: productId },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });

    return successRes(review)
  }

  async remove(userId: number, id: number) {
    const review = await this.reviewRepository.findOne({
      where: { id, userId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.reviewRepository.remove(review);
    return successRes({})
  }
}
