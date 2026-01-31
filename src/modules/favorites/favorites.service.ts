import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Favourite } from 'src/entities/favourite.entity';
import { Product } from 'src/entities/product.entity';
import { Repository } from 'typeorm';
import { AddToFavoritesDto } from './dto/addtofavorite';
import { successRes } from '../utils/success-res';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favourite)
    private favoriteRepository: Repository<Favourite>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) { }

  async addToFavorites(userId: number, addToFavoritesDto: AddToFavoritesDto) {
    const { productId } = addToFavoritesDto;

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.favoriteRepository.findOne({
      where: { userId, productId },
    });

    if (existing) {
      return { message: 'Product alread in favorites' };
    }
    const favorite = this.favoriteRepository.create({
      userId,
      productId,
    });

    await this.favoriteRepository.save(favorite);
    return successRes(favorite, 'Added to favorites');
  }

  async findAll(userId: number) {
    return successRes(await this.favoriteRepository.find({
      where: { userId },
      relations: ['product'],
    }))
  }

  async remove(userId: number, productId: number) {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId: userId, productId: productId },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.favoriteRepository.remove(favorite);
    return successRes({}, 'Removed from favorites');
  }
}
