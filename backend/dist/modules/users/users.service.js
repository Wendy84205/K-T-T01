"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_repository_1 = require("../../database/repositories/user.repository");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async create(createUserDto) {
        if (!createUserDto.username || !createUserDto.email || !createUserDto.password) {
            throw new Error('Required fields missing');
        }
        const emailExists = await this.userRepository.isEmailExists(createUserDto.email);
        const usernameExists = await this.userRepository.isUsernameExists(createUserDto.username);
        if (emailExists || usernameExists) {
            throw new common_1.ConflictException('User already exists');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
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
    async findAll() {
        return await this.userRepository.findActiveUsers();
    }
    async findOne(id) {
        const user = await this.userRepository.findUserWithRoles(id);
        if (!user) {
            throw new common_1.NotFoundException(`User not found`);
        }
        return user;
    }
    async update(id, updateUserDto) {
        const user = await this.findOne(id);
        if (updateUserDto.password) {
            const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
            user.passwordHash = hashedPassword;
            user.lastPasswordChange = new Date();
        }
        Object.assign(user, updateUserDto);
        return await this.userRepository.save(user);
    }
    async remove(id) {
        await this.userRepository.deactivateUser(id);
    }
    async findByEmail(email) {
        return await this.userRepository.findByEmail(email);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_repository_1.UserRepository)),
    __metadata("design:paramtypes", [user_repository_1.UserRepository])
], UsersService);
//# sourceMappingURL=users.service.js.map