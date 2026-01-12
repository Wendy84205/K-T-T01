// src/database/repositories/user.repository.ts
import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entities/core/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  
  async findByEmail(email: string): Promise<User | undefined> {
    return this.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.findOne({ where: { username } });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.find({ 
      where: { isActive: true },
      order: { createdAt: 'DESC' }
    });
  }

  async findUserWithRoles(id: string): Promise<User | undefined> {
    return this.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role']
    });
  }

  async isEmailExists(email: string): Promise<boolean> {
    const count = await this.count({ where: { email } });
    return count > 0;
  }

  async isUsernameExists(username: string): Promise<boolean> {
    const count = await this.count({ where: { username } });
    return count > 0;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.create(userData);
    return this.save(user);
  }

  async deactivateUser(id: string): Promise<void> {
    await this.update(id, { 
      isActive: false, 
      deletedAt: new Date() 
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.update(id, { lastLoginAt: new Date() });
  }
}