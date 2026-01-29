// src/modules/users/users.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../../database/repositories/user.repository';
import { User } from '../../database/entities/core/user.entity';
import { Role } from '../../database/entities/core/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<any> {
    if (!createUserDto.username || !createUserDto.email || !createUserDto.password) {
      throw new Error('Required fields missing');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      passwordHash: hashedPassword,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      mfaRequired: createUserDto.mfaRequired ?? true,
      isActive: true,
      isEmailVerified: false,
    });
    return await this.userRepository.save(user);
  }

  async findAll(options: {
    page: number;
    limit: number;
    role?: string;
    status?: string;
    search?: string;
  } = { page: 1, limit: 10 }): Promise<any> {
    const { page, limit, role, status, search } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (status) {
      if (status === 'Active') {
        queryBuilder.andWhere('user.isActive = :isActive', { isActive: true });
        queryBuilder.andWhere('user.isLocked = :isLocked', { isLocked: false });
      } else if (status === 'Pending') {
        queryBuilder.andWhere('user.isActive = :isActive', { isActive: false });
      } else if (status === 'Banned') {
        queryBuilder.andWhere('user.isLocked = :isLocked', { isLocked: true });
      }
    }

    if (role && role !== 'All Roles') {
      // Backend roles map: Admin -> System Admin, etc.
      // Frontend sends mapped, or raw? Usually sending simple strings.
      // Let's assume frontend sends 'Admin' or specific DB role name.
      // Better to check if role name contained in user roles
      queryBuilder.andWhere('role.name = :roleName', { roleName: role });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.email LIKE :search OR user.username LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles']
    });
    if (!user) throw new NotFoundException(`User not found`);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      user.passwordHash = hashedPassword;
      user.lastPasswordChange = new Date();
    }

    if (updateUserDto.roles) {
      const roles = await this.roleRepository.find({
        where: { name: In(updateUserDto.roles) }
      });
      user.roles = roles;
    }

    // Assign other fields (isActive, isLocked, lockReason, etc.)
    const { password, roles, ...otherFields } = updateUserDto;
    Object.assign(user, otherFields);

    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.update(id, { isActive: false, deletedAt: new Date() });
  }

  async findByEmail(email: string): Promise<any> {
    return await this.userRepository.findOne({ where: { email } });
  }
}