"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../entities/core/user.entity");
let UserRepository = class UserRepository extends typeorm_1.Repository {
    async findByEmail(email) {
        return this.findOne({ where: { email } });
    }
    async findByUsername(username) {
        return this.findOne({ where: { username } });
    }
    async findActiveUsers() {
        return this.find({
            where: { isActive: true },
            order: { createdAt: 'DESC' }
        });
    }
    async findUserWithRoles(id) {
        return this.findOne({
            where: { id },
            relations: ['userRoles', 'userRoles.role']
        });
    }
    async isEmailExists(email) {
        const count = await this.count({ where: { email } });
        return count > 0;
    }
    async isUsernameExists(username) {
        const count = await this.count({ where: { username } });
        return count > 0;
    }
    async createUser(userData) {
        const user = this.create(userData);
        return this.save(user);
    }
    async deactivateUser(id) {
        await this.update(id, {
            isActive: false,
            deletedAt: new Date()
        });
    }
    async updateLastLogin(id) {
        await this.update(id, { lastLoginAt: new Date() });
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, typeorm_1.EntityRepository)(user_entity_1.User)
], UserRepository);
//# sourceMappingURL=user.repository.js.map