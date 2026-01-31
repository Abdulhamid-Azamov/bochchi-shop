import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './config/type-orm.config';
import { User } from './entities/user.entity';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/users.module';
import { CategoiresModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { CartsModule } from './modules/carts/carts.module';
import { SeedService } from './common/seed.service';
import { OrdersModule } from './modules/orders/orders.module';
import { ReviewsModule } from './modules/reviews/review.module';
import { FavoritesModule } from './modules/favorites/favorites.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(
      dataSourceOptions,
    ),
    TypeOrmModule.forFeature([User]),
    AuthModule,
    UserModule,
    CategoiresModule,
    ProductsModule,
    CartsModule,
    OrdersModule,
    ReviewsModule,
    FavoritesModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
