import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserRole, UsersService } from './users.service';
import { RoleGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { User, UserRole } from 'src/entities/user.entity';
import { CreateAdminDto } from './dto/create-admin.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Post('admin')
  @UseGuards(RoleGuard)
  @Roles(UserRole.SUPERADMIN)
  createAdmin(@Body() createAdminDto: CreateAdminDto, @Request() req) {
    return this.userService.createAdmin(createAdminDto, req.user.role);
  }

  @Get()
  @UseGuards(RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  getAllUsers(@Request() req) {
    return this.userService.getAllUsers(req.user.role);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return this.userService.getProfile(req.user.id);
  }

  @Patch(':id/role')
  @UseGuards(RoleGuard)
  @Roles(UserRole.SUPERADMIN)
  updateUserRole(
    @Param('id') id: string,
    @Body() updateUserRole: UpdateUserRole,
    @Request() req,
  ) {
    return this.userService.updateUserRole(+id, updateUserRole, req.user.role);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  deleteUser(@Param('id') id: string, @Request() req) {
    return this.userService.deleteUser(+id, req.user.role, req.user.id);
  }
}
