import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';
import { AddToFavoritesDto } from './dto/addtofavorite';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  addFavorites(@Request() req, @Body() addToFavoritesDto: AddToFavoritesDto) {
    return this.favoritesService.addToFavorites(req.user.id, addToFavoritesDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.favoritesService.findAll(req.user.id);
  }

  @Delete()
  remove(@Request() req, @Param('productId') productId: string) {
    return this.favoritesService.remove(req.user.id, +productId);
  }
}
