import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { validateUuid } from '../common/utils/uuid';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-user.dto';
import User from './entities/user.entity';
import { ERROR_MESSAGES } from '../common/constants';
import { User as PrismaUser } from '@prisma/client';

@Injectable()
export class UserService {
  private readonly saltRounds =
    Number(process.env.CRYPT_SALT) > 0 &&
    Number.isInteger(Number(process.env.CRYPT_SALT))
      ? Number(process.env.CRYPT_SALT)
      : 10;

  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const now = new Date();
    const hashedPassword = await this.hashPassword(createUserDto.password);
    const user = await this.prisma.user.create({
      data: {
        id: randomUUID(),
        login: createUserDto.login,
        password: hashedPassword,
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

  async update(id: string, updatePasswordDto: UpdatePasswordDto) {
    validateUuid(id, 'userId');
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    const isPasswordValid = await this.isPasswordMatch(
      updatePasswordDto.oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new ForbiddenException('Old password is wrong');
    }
    const hashedPassword = await this.hashPassword(
      updatePasswordDto.newPassword,
    );
    const nextUpdatedAt = this.nextTimestamp(user.updatedAt);
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
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

  private hashPassword(password: string) {
    return bcrypt.hash(password, this.saltRounds);
  }

  private isPasswordMatch(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }
}
