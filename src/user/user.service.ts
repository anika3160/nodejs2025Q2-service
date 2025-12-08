import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { validateUuid } from '../common/utils/uuid';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-user.dto';
import User from './entities/user.entity';
import { ERROR_MESSAGES } from '../common/constants';
import { User as PrismaUser } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const now = new Date();
    const user = await this.prisma.user.create({
      data: {
        id: randomUUID(),
        login: createUserDto.login,
        password: createUserDto.password,
        version: 1,
        createdAt: now,
        updatedAt: now,
      },
    });
    return this.removePassword(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map((user) => this.removePassword(user));
  }

  async findOne(id: string) {
    validateUuid(id, 'userId');
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    return this.removePassword(user);
  }

  async update(id: string, UpdatePasswordDto: UpdatePasswordDto) {
    validateUuid(id, 'userId');
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    if (user.password !== UpdatePasswordDto.oldPassword) {
      throw new ForbiddenException('Old password is wrong');
    }
    const nextUpdatedAt = this.nextTimestamp(user.updatedAt);
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        password: UpdatePasswordDto.newPassword,
        version: { increment: 1 },
        updatedAt: nextUpdatedAt,
      },
    });
    return this.removePassword(updatedUser);
  }

  async remove(id: string) {
    validateUuid(id, 'userId');
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    await this.prisma.user.delete({ where: { id } });
  }

  private removePassword(user: PrismaUser): Omit<User, 'password'> {
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    return {
      ...userWithoutPassword,
      createdAt: user.createdAt.getTime(),
      updatedAt: user.updatedAt.getTime(),
    };
  }

  private nextTimestamp(currentDate: Date) {
    const now = Date.now();
    const current = currentDate.getTime();
    return new Date(now <= current ? current + 1 : now);
  }
}
