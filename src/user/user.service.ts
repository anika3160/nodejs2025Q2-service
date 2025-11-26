import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { validateUuid } from '../common/utils/uuid';
import db, { User } from '../database/db';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-user.dto';

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
      throw new NotFoundException('User not found');
    }
    return this.removePassword(user);
  }

  update(id: string, UpdatePasswordDto: UpdatePasswordDto) {
    validateUuid(id, 'userId');
    const user = db.users.find((item) => item.id === id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.password !== UpdatePasswordDto.oldPassword) {
      throw new ForbiddenException('Old password is wrong');
    }
    user.password = UpdatePasswordDto.newPassword;
    user.version += 1;
    user.updatedAt = Date.now();
    return this.removePassword(user);
  }

  remove(id: string) {
    validateUuid(id, 'userId');
    const index = db.users.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException('User not found');
    }
    db.users.splice(index, 1);
  }

  private removePassword(user: User) {
    const { password, ...rest } = user;
    return rest;
  }
}
