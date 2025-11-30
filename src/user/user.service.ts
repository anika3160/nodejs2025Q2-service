import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { validateUuid } from '../common/utils/uuid';
import db from '../database/db';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-user.dto';
import User from './entities/user.entity';
import { ERROR_MESSAGES } from '../common/constants';

@Injectable()
export class UserService {
  create(createUserDto: CreateUserDto) {
    const now = Date.now();
    const user: User = {
      id: randomUUID(),
      login: createUserDto.login,
      password: createUserDto.password,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    db.users.push(user);
    return this.removePassword(user);
  }

  findAll() {
    return db.users.map(this.removePassword);
  }

  findOne(id: string) {
    validateUuid(id, 'userId');
    const user = db.users.find((item) => item.id === id);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    return this.removePassword(user);
  }

  update(id: string, UpdatePasswordDto: UpdatePasswordDto) {
    validateUuid(id, 'userId');
    const user = db.users.find((item) => item.id === id);
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    if (user.password !== UpdatePasswordDto.oldPassword) {
      throw new ForbiddenException('Old password is wrong');
    }
    user.password = UpdatePasswordDto.newPassword;
    user.version += 1;
    const now = Date.now();
    user.updatedAt = now <= user.updatedAt ? user.updatedAt + 1 : now;
    return this.removePassword(user);
  }

  remove(id: string) {
    validateUuid(id, 'userId');
    const index = db.users.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    db.users.splice(index, 1);
  }

  private removePassword(user: User) {
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    return userWithoutPassword;
  }
}
