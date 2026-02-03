// src/modules/users/users.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../../database/repositories/user.repository';
import { User } from '../../database/entities/core/user.entity';
import { Role } from '../../database/entities/core/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository, In, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SecurityService } from '../security/security.service';
import { MfaSetting } from '../../database/entities/auth/mfa-setting.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(MfaSetting)
    private mfaSettingRepository: Repository<MfaSetting>,
    private securityService: SecurityService,
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
      phone: createUserDto.phone,
      employeeId: createUserDto.employeeId,
      jobTitle: createUserDto.jobTitle,
      department: createUserDto.department,
      securityClearanceLevel: createUserDto.securityClearanceLevel || 1,
      avatarUrl: createUserDto.avatarUrl,
      mfaRequired: createUserDto.mfaRequired ?? true,
      isActive: createUserDto.isActive ?? false,
      status: createUserDto.status ?? 'pending',
      isEmailVerified: false,
    });

    const savedUser = await this.userRepository.save(user);

    // MFA SETTINGS
    if (createUserDto.totpSecret) {
      await this.mfaSettingRepository.save({
        userId: savedUser.id,
        totpSecret: createUserDto.totpSecret,
        totpEnabled: true,
        totpVerifiedAt: new Date(),
      });
    }

    // LOGGING
    await this.securityService.createAuditLog({
      eventType: 'USER_CREATED',
      entityType: 'User',
      entityId: savedUser.id,
      description: `New user identity created: ${savedUser.username}`,
      newValues: { username: savedUser.username, email: savedUser.email, role: createUserDto.roles }
    });

    // If roles provided, assign them
    if (createUserDto.roles && createUserDto.roles.length > 0) {
      const roles = await this.roleRepository.find({
        where: { name: In(createUserDto.roles) }
      });

      for (const role of roles) {
        await this.userRepository.query(
          "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
          [savedUser.id, role.id]
        );
      }
      (savedUser as any).roles = roles;
    }

    return savedUser;
  }

  async findAll(options: {
    page: number;
    limit: number;
    role?: string;
    status?: string;
    search?: string;
  } = { page: 1, limit: 10 }): Promise<any> {
    console.log('[DEBUG] UsersService.findAll called with:', options);
    const { page, limit, role, status, search } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .where('user.deletedAt IS NULL')
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (status && status !== 'All Status') {
      queryBuilder.andWhere('user.status = :status', { status: status.toLowerCase() });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.email LIKE :search OR user.username LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Role filtering with subquery
    if (role && role !== 'All Roles') {
      queryBuilder.andWhere(
        `user.id IN (
          SELECT ur.user_id FROM user_roles ur 
          INNER JOIN roles r ON ur.role_id = r.id 
          WHERE r.name = :roleName
        )`,
        { roleName: role }
      );
    }

    const [users, total] = await queryBuilder.getManyAndCount();
    console.log(`[DEBUG] findAll: Found ${users.length} users in page, total=${total}`);

    // Fetch roles manually to avoid QueryBuilder join issues
    const userIds = users.map(u => u.id);
    if (userIds.length > 0) {
      try {
        const allRoles = await this.userRepository.query("SELECT * FROM `roles` LIMIT 100");
        const userRoles = await this.userRepository.query(
          "SELECT `user_id`, `role_id` FROM `user_roles` WHERE `user_id` IN (?)",
          [userIds]
        );

        users.forEach(user => {
          const uRoleIds = userRoles
            .filter(ur => ur.user_id === user.id)
            .map(ur => ur.role_id);
          (user as any).roles = allRoles.filter(r => uRoleIds.includes(r.id));
        });

        // Fetch MFA secrets
        const allMfa = await this.userRepository.query(
          "SELECT user_id, totp_secret FROM mfa_settings WHERE user_id IN (?)",
          [userIds]
        );
        users.forEach(user => {
          const mfa = allMfa.find(m => m.user_id === user.id);
          if (mfa) {
            (user as any).totpSecret = mfa.totp_secret;
          }
        });
      } catch (err) {
        console.error('[ERROR] Failed to fetch roles:', err);
      }
    }

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: {
        total,
        active: await this.userRepository.countBy({ status: 'active', deletedAt: IsNull() }),
        pending: await this.userRepository.countBy({ status: 'pending', deletedAt: IsNull() }),
        banned: await this.userRepository.countBy({ status: 'banned', deletedAt: IsNull() })
      }
    };
  }

  async findOne(id: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id }
    });
    if (!user) throw new NotFoundException(`User not found`);

    // Fetch roles separately
    const userRoles = await this.userRepository.query(
      "SELECT `role_id` FROM `user_roles` WHERE `user_id` = ?",
      [id]
    );
    const roleIds = userRoles.map(ur => ur.role_id);
    if (roleIds.length > 0) {
      const allRoles = await this.userRepository.query("SELECT * FROM `roles` LIMIT 100");
      (user as any).roles = allRoles.filter(r => roleIds.includes(r.id));
    } else {
      (user as any).roles = [];
    }

    // Fetch MFA settings
    const mfaSetting = await this.mfaSettingRepository.findOne({ where: { userId: id } });
    if (mfaSetting) {
      (user as any).totpSecret = mfaSetting.totpSecret;
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUserId?: string): Promise<any> {
    const user = await this.findOne(id);

    // SECURITY: Admin cannot demote themselves (remove Admin role)
    if (id === currentUserId && updateUserDto.roles) {
      const isAdminBefore = user.roles.some(r => r.name === 'Admin');
      const isAdminAfter = updateUserDto.roles.includes('Admin');
      if (isAdminBefore && !isAdminAfter) {
        throw new ConflictException('Admin cannot demote themselves to ensure system availability.');
      }
    }

    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      user.passwordHash = hashedPassword;
      user.lastPasswordChange = new Date();
    }

    // Handle Role Update with direct SQL to bypass TypeORM relation issues
    if (updateUserDto.roles && updateUserDto.roles.length > 0) {
      // Get role IDs for the requested role names
      const newRoles = await this.roleRepository.find({
        where: { name: In(updateUserDto.roles) }
      });

      if (newRoles.length > 0) {
        // Manual update of user_roles table to avoid TypeORM issues
        // 1. Remove existing roles
        await this.userRepository.query("DELETE FROM user_roles WHERE user_id = ?", [id]);

        // 2. Insert new roles
        for (const role of newRoles) {
          await this.userRepository.query(
            "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
            [id, role.id]
          );
        }

        // Update user object for return
        user.roles = newRoles;
      }
    }

    // Direct assignment for other fields
    const { password, roles, ...otherFields } = updateUserDto;

    // Explicitly handle status transition logic
    if (otherFields.status) {
      if (otherFields.status === 'active') {
        user.isActive = true;
        user.isLocked = false;
      } else if (otherFields.status === 'banned') {
        user.isActive = false;
        user.isLocked = true;
      }
      user.status = otherFields.status;
    }

    Object.assign(user, otherFields);

    // MFA UPDATE
    if (updateUserDto.totpSecret) {
      const mfaSetting = await this.mfaSettingRepository.findOne({ where: { userId: id } });
      if (mfaSetting) {
        await this.mfaSettingRepository.update({ userId: id }, {
          totpSecret: updateUserDto.totpSecret,
          totpEnabled: true,
          totpVerifiedAt: mfaSetting.totpVerifiedAt || new Date(),
        });
      } else {
        await this.mfaSettingRepository.save({
          userId: id,
          totpSecret: updateUserDto.totpSecret,
          totpEnabled: true,
          totpVerifiedAt: new Date(),
        });
      }
    }

    const updatedUser = await this.userRepository.save(user);

    // LOGGING
    await this.securityService.createAuditLog({
      userId: currentUserId,
      eventType: 'USER_UPDATED',
      entityType: 'User',
      entityId: updatedUser.id,
      description: `User identity modified: ${updatedUser.username}`,
      newValues: otherFields
    });

    return updatedUser;
  }

  async updateStatus(id: string, status: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const oldStatus = user.status;
    user.status = status;
    if (status === 'active') {
      user.isActive = true;
      user.isLocked = false;
    } else if (status === 'banned') {
      user.isActive = false;
      user.isLocked = true;
    }

    const savedUser = await this.userRepository.save(user);

    // LOGGING
    await this.securityService.createAuditLog({
      eventType: 'USER_STATUS_CHANGED',
      entityType: 'User',
      entityId: id,
      description: `User status transitioned from ${oldStatus} to ${status}: ${user.username}`,
      oldValues: { status: oldStatus },
      newValues: { status: status }
    });

    return savedUser;
  }

  async bulkUpdateStatus(ids: string[], status: string): Promise<void> {
    const isActive = status === 'active';
    const isLocked = status === 'banned';
    await this.userRepository.createQueryBuilder()
      .update(User)
      .set({ status, isActive, isLocked } as any)
      .where("id IN (:...ids)", { ids })
      .execute();

    // LOGGING
    await this.securityService.createAuditLog({
      eventType: 'BULK_USER_STATUS_UPDATE',
      entityType: 'User',
      description: `Bulk status update to ${status} for ${ids.length} users.`,
      metadata: { userIds: ids, newStatus: status }
    });
  }

  async globalLockdown(): Promise<void> {
    // Lock all non-admin users
    await this.userRepository.query(`
      UPDATE users SET 
        status = 'banned', 
        is_active = 0, 
        is_locked = 1 
      WHERE id NOT IN (
        SELECT user_id FROM (
          SELECT user_id FROM user_roles ur 
          JOIN roles r ON ur.role_id = r.id 
          WHERE r.name = 'Admin'
        ) AS admin_users
      )
    `);

    // LOGGING
    await this.securityService.createAuditLog({
      eventType: 'GLOBAL_SYSTEM_LOCKDOWN',
      entityType: 'System',
      description: `EMERGENCY: Global lockdown initiated. All non-admin accounts restricted.`,
      severity: 'CRITICAL'
    });
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.update(id, {
      isActive: false,
      status: 'banned',
      deletedAt: new Date()
    });

    // LOGGING
    await this.securityService.createAuditLog({
      eventType: 'USER_DEACTIVATED',
      entityType: 'User',
      entityId: id,
      description: `User identity de-activated/soft-deleted.`
    });
  }

  async hardDelete(id: string): Promise<void> {
    // Delete from all potential related tables to avoid FK issues
    const tables = [
      'user_roles',
      'team_members',
      'audit_logs',
      'security_events',
      'user_sessions',
      'mfa_settings'
    ];

    for (const table of tables) {
      try {
        await this.userRepository.query(`DELETE FROM ${table} WHERE user_id = ?`, [id]);
      } catch (e) {
        // Table might not have user_id or other issue, skip
      }
    }

    await this.userRepository.delete(id);

    // LOGGING
    await this.securityService.createAuditLog({
      eventType: 'USER_PURGED',
      entityType: 'User',
      entityId: id,
      description: `User identity PERMANENTLY PURGED from system cluster.`,
      severity: 'ERROR'
    });
  }

  async findByEmail(email: string): Promise<any> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async resetPassword(id: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const tempPassword = `Sentinel!${Math.random().toString(36).slice(-6)}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    user.passwordHash = hashedPassword;
    user.lastPasswordChange = new Date();
    await this.userRepository.save(user);

    await this.securityService.createAuditLog({
      eventType: 'USER_PASSWORD_RESET',
      entityType: 'User',
      entityId: id,
      description: `Administrative password reset for user: ${user.username}`,
      severity: 'MEDIUM'
    });

    return {
      username: user.username,
      temporaryPassword: tempPassword,
      message: 'Temporary password generated.'
    };
  }
}