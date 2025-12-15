import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';

interface TokenPayload {
  userId: string;
  login: string;
}

@Injectable()
export class AuthService {
  private readonly accessSecret = this.requireEnv('JWT_SECRET_KEY');
  private readonly refreshSecret = this.requireEnv('JWT_SECRET_REFRESH_KEY');
  private readonly accessExpiresIn = process.env.TOKEN_EXPIRE_TIME || '5m';
  private readonly refreshExpiresIn =
    process.env.TOKEN_REFRESH_EXPIRE_TIME || '7d';

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  signup(createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { login: loginDto.login },
    });

    if (!user) {
      throw new ForbiddenException('Authentication failed');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new ForbiddenException('Authentication failed');
    }

    return this.generateTokens({ userId: user.id, login: user.login });
  }

  async refresh(refreshToken: string) {
    let payload: TokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<TokenPayload>(refreshToken, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new ForbiddenException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.login !== payload.login) {
      throw new ForbiddenException('Invalid refresh token');
    }

    return this.generateTokens({ userId: user.id, login: user.login });
  }

  private async generateTokens(payload: TokenPayload) {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.accessSecret,
      expiresIn: this.accessExpiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  private requireEnv(key: string) {
    const value = process.env[key];
    if (!value) {
      throw new InternalServerErrorException(
        `Missing environment variable ${key}`,
      );
    }
    return value;
  }
}
