import { Repository } from 'typeorm';
import { User } from '../entities/core/user.entity';
export declare class UserRepository extends Repository<User> {
    findByEmail(email: string): Promise<User | undefined>;
    findByUsername(username: string): Promise<User | undefined>;
    findActiveUsers(): Promise<User[]>;
    findUserWithRoles(id: string): Promise<User | undefined>;
    isEmailExists(email: string): Promise<boolean>;
    isUsernameExists(username: string): Promise<boolean>;
    createUser(userData: Partial<User>): Promise<User>;
    deactivateUser(id: string): Promise<void>;
    updateLastLogin(id: string): Promise<void>;
}
