import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly publicPaths = [
    '/',
    '/auth/signup',
    '/auth/login',
    '/auth/refresh',
    '/doc',
  ];

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.path || request.url;

    if (this.isPublicPath(path)) {
      return true;
    }

    const authHeader = request.headers.authorization;
    if (!authHeader || Array.isArray(authHeader)) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [scheme, token] = authHeader.split(' ');
    if (!token || scheme.toLowerCase() !== 'bearer') {
      throw new UnauthorizedException('Invalid authorization header');
    }

    try {
      await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private isPublicPath(path: string) {
    if (path === '/') {
      return true;
    }
    return this.publicPaths.some(
      (publicPath) =>
        path === publicPath ||
        (publicPath !== '/' && path.startsWith(publicPath)),
    );
  }
}
