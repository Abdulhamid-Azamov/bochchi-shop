import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserController } from './users.controller';
import { UsersService } from './users.service';
import { AuthSession } from 'src/entities/auth-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, AuthSession])],
  controllers: [UserController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UserModule { }
