import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthSession } from 'src/entities/auth-session.entity';
import { OtpCode, OtpPurpose } from 'src/entities/otp-code.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { successRes } from '../utils/success-res';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(OtpCode)
    private otpRepository: Repository<OtpCode>,
    @InjectRepository(AuthSession)
    private sessionRepository: Repository<AuthSession>,
    private jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

    const existUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    const otp = this.generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const otpCode = this.otpRepository.create({
      user: { id: user.id },
      code: otp,
      purpose: OtpPurpose.VERIFY,
      expiresAt,
    });

    await this.otpRepository.save(otpCode);

    console.log(`OTP for ${email}: ${otp}`);

    return {
      message:
        'Registration successful, please verify your email using the OTP sent.',
      userId: user.id,
      otpCode
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const isPasswordValid = bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email firstly');
    }

    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const session = this.sessionRepository.create({
      user: { id: user.id },
      refreshToken: refreshToken,
      expiresAt: expiresAt,
    });

    await this.sessionRepository.save(session);

    return successRes({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, code } = verifyOtpDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otpCode = await this.otpRepository.findOne({
      where: {
        user: { id: user.id },
        code,
        purpose: OtpPurpose.VERIFY,
      },
      order: { id: 'DESC' },
    });

    if (!otpCode) {
      throw new BadRequestException('Invalid otp code');
    }

    if (new Date() > otpCode.expiresAt) {
      throw new BadRequestException('Otp code has expired ');
    }

    user.isVerified = true;
    await this.userRepository.save(user);

    await this.otpRepository.delete(otpCode.id);

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = this.generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const otpCode = this.otpRepository.create({
      user: { id: user.id },
      code: otp,
      purpose: OtpPurpose.RESET,
      expiresAt,
    });

    await this.otpRepository.save(otpCode);

    console.log(`Password reset OTP for ${email}: ${otp}`);

    return { message: 'Password reset code sent to your email' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, code, newPassword } = resetPasswordDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otpCode = await this.otpRepository.findOne({
      where: {
        user: { id: user.id },
        code,
        purpose: OtpPurpose.RESET,
      },
      order: { id: 'DESC' },
    });

    if (!otpCode) {
      throw new BadRequestException('Invalid OTP code');
    }

    if (new Date() > otpCode.expiresAt) {
      throw new BadRequestException('OTP code has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    await this.otpRepository.delete(otpCode.id);
    return { message: 'Password reset successfully' };
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async generateAccessToken(user: User): Promise<string> {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const payload = { sub: user.id, email: user.email };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env
        .JWT_REFRESH_EXPIRES_IN as JwtSignOptions['expiresIn'],
    });
  }
}
