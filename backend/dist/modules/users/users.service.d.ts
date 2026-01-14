import { UserRepository } from '../../database/repositories/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private userRepository;
    constructor(userRepository: UserRepository);
    create(createUserDto: CreateUserDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<any>;
    remove(id: string): Promise<void>;
    findByEmail(email: string): Promise<any>;
}
