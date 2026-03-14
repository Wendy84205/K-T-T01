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
import { UserSession } from '../../database/entities/auth/user-session.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(MfaSetting)
    private mfaSettingRepository: Repository<MfaSetting>,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
    private securityService: SecurityService,
    private notificationService: NotificationService,
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
      .leftJoinAndSelect('user.roles', 'role')
      .where('user.deletedAt IS NULL')
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (status && status !== 'All Status') {
      const dbStatus = status.toLowerCase();
      queryBuilder.andWhere('user.status = :status', { status: dbStatus });
    }

    if (role && role !== 'All Roles') {
      queryBuilder.andWhere('role.name = :role', { role });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search OR user.username LIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [users, total] = await queryBuilder.getManyAndCount();

    // Fetch MFA secrets separately if needed, or leave it for findOne
    const userIds = users.map(u => u.id);
    if (userIds.length > 0) {
      try {
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
      where: { id },
      relations: ['roles']
    });
    if (!user) throw new NotFoundException(`User not found`);

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

    // PERMANENT MFA BYPASS FOR MAIN ADMIN
    if (user.email === 'admin@cybersecure.local') {
      updateUserDto.mfaRequired = false;
    }

    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      user.passwordHash = hashedPassword;
      user.lastPasswordChange = new Date();
    }

    // Handle Role Update with TypeORM relations (cascade: true enabled)
    if (updateUserDto.roles && updateUserDto.roles.length > 0) {
      const newRoles = await this.roleRepository.find({
        where: { name: In(updateUserDto.roles) }
      });

      if (newRoles.length > 0) {
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

    // NOTIFY USER
    try {
      await this.notificationService.create({
        userId: id,
        type: 'USER_UPDATED',
        title: 'Profile Updated',
        message: 'Your account information has been updated. If you did not make this change, please contact support immediately.',
        priority: 'medium',
        category: 'security'
      });
    } catch (err) {
      console.error('Failed to send notification', err);
    }

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
      { name: 'user_roles', col: 'user_id' },
      { name: 'team_members', col: 'user_id' },
      { name: 'audit_logs', col: 'user_id' },
      { name: 'security_events', col: 'user_id' },
      { name: 'user_sessions', col: 'user_id' },
      { name: 'mfa_settings', col: 'user_id' },
      { name: 'messages', col: 'sender_id' },
      { name: 'files', col: 'owner_id' },
      { name: 'folders', col: 'owner_id' },
      { name: 'conversation_members', col: 'user_id' },
      { name: 'notifications', col: 'user_id' },
      { name: 'message_reactions', col: 'user_id' },
      { name: 'message_read_receipts', col: 'user_id' },
      { name: 'pinned_messages', col: 'pinned_by' },
      { name: 'file_shares', col: 'from_user_id' },
      { name: 'file_versions', col: 'created_by' },
      { name: 'access_requests', col: 'requester_id' },
      { name: 'tasks', col: 'assigned_to' }
    ];

    for (const table of tables) {
      try {
        await this.userRepository.query(`DELETE FROM ${table.name} WHERE ${table.col} = ?`, [id]);
      } catch (e) {
        // Table might not exist or column name mismatch, skip silently
        console.warn(`[CLEANUP] Could not delete from ${table.name}: ${e.message}`);
      }
    }

    await this.userRepository.delete(id);

    // LOGGING (Cannot use user_id here as it's gone, using system log or audit with null user)
    await this.securityService.createAuditLog({
      eventType: 'USER_PURGED_PERMANENTLY',
      entityType: 'User',
      entityId: id,
      description: `User identity ${id} PERMANENTLY PURGED from system cluster.`,
      severity: 'CRITICAL'
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

  async getUserActivity(userId: string): Promise<any[]> {
    return this.userRepository.query(
      "SELECT event_type as eventType, description, created_at as createdAt FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
      [userId]
    );
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    return this.userSessionRepository.find({
      where: { userId, revokedAt: IsNull() },
      order: { lastAccessedAt: 'DESC' }
    });
  }

  async revokeSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.userSessionRepository.findOne({
      where: { id: sessionId, userId }
    });
    if (!session) throw new NotFoundException('Session not found');

    session.revokedAt = new Date();
    session.revokedReason = 'User requested revocation';
    await this.userSessionRepository.save(session);
  }

  async revokeSessionById(sessionId: string): Promise<void> {
    const session = await this.userSessionRepository.findOne({
      where: { id: sessionId }
    });
    if (!session) throw new NotFoundException('Session not found');

    session.revokedAt = new Date();
    session.revokedReason = 'Administrative revocation';
    await this.userSessionRepository.save(session);
  }
}
