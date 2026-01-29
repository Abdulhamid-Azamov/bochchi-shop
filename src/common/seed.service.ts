import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.createSuperAdmin();
  }

  private async createSuperAdmin() {
    try {
      const superAdminEmail = process.env.SUPERADMIN_EMAIL;
      const superAdminPassword = String(process.env.SUPERADMIN_PASSWORD);
      const superAdminUsername = process.env.SUPERADMIN_USERNAME;

      const existingSuperadmin = await this.userRepository.findOne({
        where: { email: superAdminEmail },
      });
      if (existingSuperadmin) {
        this.logger.log('SuperAdmin already exists');
        return;
      }

      const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

      const superAdmin = this.userRepository.create({
        username: superAdminUsername,
        email: superAdminEmail,
        password: hashedPassword,
        role: UserRole.SUPERADMIN,
        isVerified: true,
      });

      await this.userRepository.save(superAdmin);

      this.logger.log('SuperAdmin created successfully');
    } catch (error) {
      this.logger.error('Failed to create SuperAdmin', error);
    }
  }
}
