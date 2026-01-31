import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/category.dto';
import { UpdateCategoryDto } from './dto/categoryupdate.dto';
import { successRes } from '../utils/success-res';
import { Product } from 'src/entities/product.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) { }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepository.create(createCategoryDto);
    if (!createCategoryDto.name) {
      throw new BadRequestException('Category name is required');
    }

    const existingCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException('Category already exists');
    }
    const saved = await this.categoryRepository.save(category);
    return successRes(saved, "Category created")
  }

  async findAll() {
    const category = await this.categoryRepository.find({
      relations: ['products'],
    });
    return successRes(category)
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return successRes(category);
  }

  async updateCategory(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException('Category not found')
    }
    Object.assign(category, updateCategoryDto);
    const saveUpdate = await this.categoryRepository.save(category);
    return successRes(saveUpdate)
  }

  async remove(id: number) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException('Category not found')
    }
    const productsCount = await this.productRepository.count({
      where: { category: { id } },
    });

    if (productsCount > 0) {
      throw new BadRequestException(
        'This category has products. Remove or move them first.',
      );
    }

    await this.categoryRepository.remove(category);
    await this.categoryRepository.remove(category);
    return successRes({}, 'Deleted successfully');
  }
}
