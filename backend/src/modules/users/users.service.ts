// src/modules/users/users.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../../database/repositories/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository) 
    private userRepository: UserRepository,  
  ) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    // Manual validation
    if (!createUserDto.username || !createUserDto.email || !createUserDto.password) {
      throw new Error('Required fields missing');
    }

    // Check if user exists using repository method
    const emailExists = await this.userRepository.isEmailExists(createUserDto.email);
    const usernameExists = await this.userRepository.isUsernameExists(createUserDto.username);

    if (emailExists || usernameExists) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user using repository
    const user = await this.userRepository.createUser({
      username: createUserDto.username,
      email: createUserDto.email,
      passwordHash: hashedPassword,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      mfaRequired: createUserDto.mfaRequired ?? true,
      isActive: true,
      isEmailVerified: false,
    });

    return user;
  }

  async findAll(): Promise<any[]> {
    // Use custom repository method
    return await this.userRepository.findActiveUsers();
  }

  async findOne(id: string): Promise<any> {
    // Use custom repository method with relations
    const user = await this.userRepository.findUserWithRoles(id);
    
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.findOne(id);
    
    // Update password if provided
    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      (user as any).passwordHash = hashedPassword;
      (user as any).lastPasswordChange = new Date();
    }
    
    // Update other fields
    Object.assign(user, updateUserDto);
    
    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    // Use custom repository method
    await this.userRepository.deactivateUser(id);
  }

  async findByEmail(email: string): Promise<any> {
    return await this.userRepository.findByEmail(email);
  }
}