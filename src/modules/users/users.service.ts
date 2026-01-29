import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAdminDto } from './dto/create-admin.dto';



export class UpdateUserRole {
  role: UserRole;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async createAdmin(createAdminDto: CreateAdminDto, creatorRole: UserRole) {
    if (creatorRole !== UserRole.SUPERADMIN) {
      throw new ForbiddenException('Only Superadmin can create admins');
    }

    const { username, email, password } = createAdminDto;

    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      role: UserRole.ADMIN,
      isVerified: true,
    });

    await this.userRepository.save(admin);
    return {
      message: 'Admin user created successfully',
      admin,
    };
  }

  async getAllUsers(requesterRole: UserRole) {
    if (
      requesterRole !== UserRole.ADMIN &&
      requesterRole !== UserRole.SUPERADMIN
    ) {
      throw new ForbiddenException('Access denied');
    }

    const users = await this.userRepository.find({
      select: ['id', 'username', 'email', 'role', 'isVerified', 'createdAt'],
      order: { createdAt: 'DESC' },
    });

    return users;
  }

  async updateUserRole(
    userId: number,
    updateUserRoleDto: UpdateUserRole,
    requesterRole: UserRole,
  ) {
    if (requesterRole !== UserRole.SUPERADMIN) {
      throw new ForbiddenException('Only SuperAdmin can change user roles');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.SUPERADMIN) {
      throw new ForbiddenException('Cannot change SuperAdmin role');
    }

    if (updateUserRoleDto.role === UserRole.SUPERADMIN) {
      throw new ForbiddenException(
        'Cannot create SuperAdmin through this endpoint',
      );
    }

    user.role = updateUserRoleDto.role;
    await this.userRepository.save(user);

    const { password: _, ...result } = user;
    return result;
  }

  async deleteUser(
    userId: number,
    requesterRole: UserRole,
    requesterId: number,
  ) {
    if (
      requesterRole !== UserRole.SUPERADMIN &&
      requesterRole !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('Acces denied');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id === requesterId) {
      throw new BadRequestException('Cannot delete yourself');
    }

    if (user.role === UserRole.SUPERADMIN) {
      throw new ForbiddenException('Cannot delete SuperAdmin');
    }

    if (requesterRole === UserRole.ADMIN && user.role === UserRole.ADMIN) {
      throw new ForbiddenException('Admins cannot delete other admins');
    }

    await this.userRepository.remove(user);

    return { message: 'User deleted Successfully' };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'email', 'role', 'isVerified', 'createdAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
