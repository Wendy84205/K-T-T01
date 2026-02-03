// src/modules/team/team.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Team } from '../../database/entities/team-collaboration/team.entity';
import { TeamMember } from '../../database/entities/team-collaboration/team-member.entity';
import { User } from '../../database/entities/core/user.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,

    @InjectRepository(TeamMember)
    private teamMemberRepository: Repository<TeamMember>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  // ========== TEAM CRUD METHODS ==========

  /**
   * Get all teams with filtering and pagination
   */
  async getAllTeams(
    filters?: {
      search?: string;
      isActive?: boolean;
      departmentId?: string;
      managerId?: string;
      isPublic?: boolean;
      createdAfter?: Date;
      createdBefore?: Date;
    },
    pagination?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{
    teams: Team[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  }> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const queryOptions: FindManyOptions<Team> = {
      relations: ['manager'],
      where: {},
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    };

    // Apply filters
    if (filters) {
      const whereConditions: any = {};

      if (filters.search) {
        whereConditions.name = Like(`%${filters.search}%`);
      }

      if (filters.isActive !== undefined) {
        whereConditions.isActive = filters.isActive;
      }

      if (filters.departmentId) {
        whereConditions.departmentId = filters.departmentId;
      }

      if (filters.managerId) {
        whereConditions.managerId = filters.managerId;
      }

      if (filters.isPublic !== undefined) {
        whereConditions.isPublic = filters.isPublic;
      }

      if (filters.createdAfter || filters.createdBefore) {
        whereConditions.createdAt = {};

        if (filters.createdAfter) {
          whereConditions.createdAt = MoreThanOrEqual(filters.createdAfter);
        }

        if (filters.createdBefore) {
          whereConditions.createdAt = LessThanOrEqual(filters.createdBefore);
        }
      }

      queryOptions.where = whereConditions;
    }

    const [teams, total] = await this.teamRepository.findAndCount(queryOptions);

    return {
      teams,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    };
  }

  /**
   * Get a single team by ID with optional relations
   */
  async getTeamById(
    teamId: string,
    options?: {
      withMembers?: boolean;
      withManager?: boolean;
      withParentTeam?: boolean;
      withStatistics?: boolean;
    }
  ): Promise<Team> {
    const findOptions: any = {
      where: { id: teamId },
    };

    // Load relations based on options
    const relations = [];

    if (options?.withManager !== false) {
      relations.push('manager');
    }

    if (options?.withMembers) {
      relations.push('members');
      relations.push('members.user');
    }

    if (options?.withParentTeam) {
      relations.push('parentTeam');
    }

    if (relations.length > 0) {
      findOptions.relations = relations;
    }

    const team = await this.teamRepository.findOne(findOptions);

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // If members were loaded, filter out inactive members
    if (options?.withMembers && team.members) {
      team.members = team.members.filter(
        (member: TeamMember) => !member.leftDate
      );
    }

    // Add statistics if requested
    if (options?.withStatistics) {
      const stats = await this.getTeamStatistics(teamId);
      (team as any).statistics = stats;
    }

    return team;
  }

  /**
   * Create a new team
   */
  async createTeam(
    name: string,
    managerId: string,
    options: {
      description?: string;
      department?: string;
      defaultSecurityLevel?: number;
      requiresMfa?: boolean;
      encryptionRequired?: boolean;
      maxMembers?: number;
      storageQuotaMb?: number;
      fileSizeLimitMb?: number;
      isPublic?: boolean;
      parentTeamId?: string;
    } = {}
  ): Promise<Team> {
    // Verify manager exists
    const manager = await this.userRepository.findOne({
      where: { id: managerId },
    });

    if (!manager) {
      throw new NotFoundException('Manager not found');
    }

    // Check if parent team exists if provided
    if (options.parentTeamId) {
      const parentTeam = await this.teamRepository.findOne({
        where: { id: options.parentTeamId, isActive: true },
      });

      if (!parentTeam) {
        throw new NotFoundException('Parent team not found');
      }
    }

    // Generate unique team code
    const code = this.generateTeamCode();

    // Check if team name already exists (case insensitive)
    const existingTeam = await this.teamRepository.findOne({
      where: { name: Like(`%${name}%`) },
    });

    if (existingTeam) {
      throw new ConflictException('A team with this name already exists');
    }

    const team = this.teamRepository.create({
      name,
      code,
      description: options.description,
      departmentId: options.department,
      managerId,
      parentTeamId: options.parentTeamId,
      defaultSecurityLevel: options.defaultSecurityLevel || 2,
      requiresMfa: options.requiresMfa ?? true,
      encryptionRequired: options.encryptionRequired ?? true,
      maxMembers: options.maxMembers || 50,
      storageQuotaMb: options.storageQuotaMb || 1024,
      fileSizeLimitMb: options.fileSizeLimitMb || 100,
      isActive: true,
      isPublic: options.isPublic || false,
    });

    const savedTeam = await this.teamRepository.save(team);

    // Add manager as team admin
    await this.addTeamMember(
      savedTeam.id,
      managerId,
      'admin',
      managerId,
      savedTeam.defaultSecurityLevel
    );

    // Update manager's primary team if not set
    if (!manager.primaryTeamId) {
      await this.userRepository.update(managerId, {
        primaryTeamId: savedTeam.id,
      });
    }

    return savedTeam;
  }

  /**
   * Update an existing team
   */
  async updateTeam(
    teamId: string,
    updateData: {
      name?: string;
      description?: string;
      departmentId?: string;
      managerId?: string;
      defaultSecurityLevel?: number;
      requiresMfa?: boolean;
      encryptionRequired?: boolean;
      maxMembers?: number;
      storageQuotaMb?: number;
      fileSizeLimitMb?: number;
      isActive?: boolean;
      isPublic?: boolean;
      parentTeamId?: string;
    },
    updatedBy: string
  ): Promise<Team> {
    const team = await this.getTeamById(teamId);

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if new manager exists
    if (updateData.managerId && updateData.managerId !== team.managerId) {
      const newManager = await this.userRepository.findOne({
        where: { id: updateData.managerId },
      });

      if (!newManager) {
        throw new NotFoundException('New manager not found');
      }

      // Remove old manager's admin role if they're being replaced
      if (team.managerId !== updateData.managerId) {
        await this.updateTeamMemberRole(
          teamId,
          updateData.managerId,
          'admin',
          updatedBy
        );
      }
    }

    // Update team
    const updatedTeam = await this.teamRepository.save({
      ...team,
      ...updateData,
      updatedAt: new Date(),
    });

    // Log the update (you could implement an audit log service)
    await this.logTeamActivity(teamId, 'UPDATE', updatedBy, updateData);

    return updatedTeam;
  }

  /**
   * Delete a team (soft delete by setting isActive to false)
   */
  async deleteTeam(teamId: string, deletedBy: string): Promise<{ message: string }> {
    const team = await this.getTeamById(teamId);

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if team has active members
    const activeMembers = await this.teamMemberRepository.count({
      where: { teamId, leftDate: null },
    });

    if (activeMembers > 0) {
      throw new BadRequestException(
        'Cannot delete team with active members. Remove all members first.'
      );
    }

    await this.teamRepository.update(teamId, {
      isActive: false,
      updatedAt: new Date(),
    });

    // Log the deletion
    await this.logTeamActivity(teamId, 'DELETE', deletedBy);

    return { message: 'Team deleted successfully' };
  }

  /**
   * Get team by code (unique identifier)
   */
  async getTeamByCode(
    teamCode: string,
    options?: {
      withMembers?: boolean;
      withManager?: boolean;
    }
  ): Promise<Team> {
    const findOptions: any = {
      where: { code: teamCode },
      relations: [],
    };

    if (options?.withManager !== false) {
      findOptions.relations.push('manager');
    }

    if (options?.withMembers) {
      findOptions.relations.push('members');
      findOptions.relations.push('members.user');
    }

    const team = await this.teamRepository.findOne(findOptions);

    if (!team) {
      throw new NotFoundException(`Team with code ${teamCode} not found`);
    }

    if (options?.withMembers && team.members) {
      team.members = team.members.filter(
        (member: TeamMember) => !member.leftDate
      );
    }

    return team;
  }

  // ========== TEAM MEMBER METHODS ==========

  /**
   * Add a member to a team
   */
  async addTeamMember(
    teamId: string,
    userId: string,
    roleInTeam: string = 'member',
    addedById: string,
    securityClearance?: number,
  ): Promise<TeamMember> {
    // Check if team exists
    const team = await this.teamRepository.findOne({ where: { id: teamId, isActive: true } });
    if (!team) {
      throw new NotFoundException('Team not found or is inactive');
    }

    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId, isActive: true } });
    if (!user) {
      throw new NotFoundException('User not found or is inactive');
    }

    // Check if addedBy user has permission
    await this.verifyTeamPermission(addedById, teamId, 'add_member');

    // Check team size limit
    const currentMembers = await this.teamMemberRepository.count({
      where: { teamId, leftDate: null },
    });

    if (currentMembers >= team.maxMembers) {
      throw new BadRequestException(
        `Team has reached maximum member limit of ${team.maxMembers}`
      );
    }

    // Check if user is already a member
    const existingMember = await this.teamMemberRepository.findOne({
      where: {
        teamId,
        userId,
        leftDate: null
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a team member');
    }

    // Verify security clearance is not higher than team's default
    const finalSecurityClearance = Math.min(
      securityClearance || team.defaultSecurityLevel,
      team.defaultSecurityLevel
    );

    const teamMember = this.teamMemberRepository.create({
      teamId,
      userId,
      roleInTeam,
      securityClearance: finalSecurityClearance,
      joinedDate: new Date(),
      addedBy: addedById,
      requiresSecurityTraining: team.requiresMfa,
    });

    const savedMember = await this.teamMemberRepository.save(teamMember);

    // Update user's primary team if not set
    if (!user.primaryTeamId) {
      await this.userRepository.update(userId, {
        primaryTeamId: teamId,
      });
    }

    // Log the addition
    await this.logTeamActivity(
      teamId,
      'ADD_MEMBER',
      addedById,
      { userId, role: roleInTeam }
    );

    return savedMember;
  }

  /**
   * Get all team members
   */
  async getTeamMembers(teamId: string): Promise<any[]> {
    const members = await this.teamMemberRepository.find({
      where: {
        teamId,
        leftDate: null
      },
      relations: ['user'],
      order: {
        roleInTeam: 'DESC', // Show admins first
        joinedDate: 'ASC'
      },
    });

    return members.map(member => ({
      id: member.user.id,
      username: member.user.username,
      email: member.user.email,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      roleInTeam: member.roleInTeam,
      securityClearance: member.securityClearance,
      joinedDate: member.joinedDate,
      requiresTraining: member.requiresSecurityTraining,
      trainingCompleted: !!member.trainingCompletedAt,
      lastLogin: member.user.lastLoginAt,
      mfaEnabled: member.user.mfaRequired,
      isActive: member.user.isActive,
      memberId: member.id,
    }));
  }

  /**
   * Update team member role
   */
  async updateTeamMemberRole(
    teamId: string,
    userId: string,
    newRole: string,
    updatedBy: string
  ): Promise<TeamMember> {
    // Check if user has permission to update roles
    await this.verifyTeamPermission(updatedBy, teamId, 'update_member_role');

    const member = await this.teamMemberRepository.findOne({
      where: {
        teamId,
        userId,
        leftDate: null
      },
    });

    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    const oldRole = member.roleInTeam;
    member.roleInTeam = newRole;

    const updatedMember = await this.teamMemberRepository.save(member);

    // Log the role change
    await this.logTeamActivity(
      teamId,
      'UPDATE_MEMBER_ROLE',
      updatedBy,
      { userId, oldRole, newRole }
    );

    return updatedMember;
  }

  /**
   * Remove a member from team
   */
  async removeTeamMember(
    teamId: string,
    userId: string,
    removedBy: string
  ): Promise<{ message: string }> {
    // Check if remover has permission
    await this.verifyTeamPermission(removedBy, teamId, 'remove_member');

    const member = await this.teamMemberRepository.findOne({
      where: {
        teamId,
        userId,
        leftDate: null
      },
    });

    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    // Prevent removing the team manager if they're the only admin
    if (member.roleInTeam === 'admin') {
      const adminCount = await this.teamMemberRepository.count({
        where: {
          teamId,
          roleInTeam: 'admin',
          leftDate: null
        },
      });

      if (adminCount <= 1) {
        throw new BadRequestException(
          'Cannot remove the only admin from the team. Promote another member first.'
        );
      }
    }

    member.leftDate = new Date();
    member.leftBy = removedBy;
    await this.teamMemberRepository.save(member);

    // Log the removal
    await this.logTeamActivity(
      teamId,
      'REMOVE_MEMBER',
      removedBy,
      { userId, role: member.roleInTeam }
    );

    return { message: 'Member removed from team successfully' };
  }

  // ========== UTILITY & HELPER METHODS ==========

  /**
   * Get teams for a specific user
   */
  async getUserTeams(userId: string): Promise<{
    managed: Team[];
    memberOf: Team[];
    total: number;
  }> {
    // Teams where user is the manager
    const managedTeams = await this.teamRepository.find({
      where: { managerId: userId, isActive: true },
      relations: ['manager'],
      order: { createdAt: 'DESC' },
    });

    // Teams where user is a member
    const teamMemberships = await this.teamMemberRepository.find({
      where: {
        userId: userId,
        leftDate: null,
      },
      relations: ['team', 'team.manager'],
    });

    const memberOfTeams = teamMemberships
      .map(membership => membership.team)
      .filter(team => team && team.isActive && team.managerId !== userId);

    return {
      managed: managedTeams,
      memberOf: memberOfTeams,
      total: managedTeams.length + memberOfTeams.length,
    };
  }

  /**
   * Get team statistics
   */
  async getTeamStatistics(teamId: string): Promise<any> {
    const totalMembers = await this.teamMemberRepository.count({
      where: { teamId, leftDate: null },
    });

    const activeUsers = await this.teamMemberRepository.count({
      where: {
        teamId,
        leftDate: null,
        user: { isActive: true }
      },
    });

    const adminsCount = await this.teamMemberRepository.count({
      where: {
        teamId,
        leftDate: null,
        roleInTeam: 'admin'
      },
    });

    const membersCount = totalMembers - adminsCount;

    // Get join dates for chart
    const joinDates = await this.teamMemberRepository
      .createQueryBuilder('member')
      .select('DATE(member.joinedDate) as date, COUNT(*) as count')
      .where('member.teamId = :teamId AND member.leftDate IS NULL', { teamId })
      .groupBy('DATE(member.joinedDate)')
      .orderBy('date')
      .getRawMany();

    return {
      totalMembers,
      activeUsers,
      adminsCount,
      membersCount,
      joinTrend: joinDates,
    };
  }

  /**
   * Search teams by name or code
   */
  async searchTeams(query: string, limit: number = 10): Promise<Team[]> {
    return this.teamRepository.find({
      where: [
        { name: Like(`%${query}%`), isActive: true },
        { code: Like(`%${query}%`), isActive: true },
      ],
      relations: ['manager'],
      take: limit,
      order: { name: 'ASC' },
    });
  }

  /**
   * Verify user permission for team operations
   */
  async verifyTeamPermission(
    userId: string,
    teamId: string,
    action: string
  ): Promise<boolean> {
    // Check if user is team manager
    const team = await this.teamRepository.findOne({
      where: { id: teamId, managerId: userId },
    });

    if (team) {
      return true; // Managers have all permissions
    }

    // Check if user is team admin
    const member = await this.teamMemberRepository.findOne({
      where: {
        teamId,
        userId,
        leftDate: null,
        roleInTeam: 'admin'
      },
    });

    if (member) {
      return true; // Admins have all permissions
    }

    // Check specific permissions
    switch (action) {
      case 'view':
        // Any team member can view
        const isMember = await this.teamMemberRepository.findOne({
          where: {
            teamId,
            userId,
            leftDate: null
          },
        });
        return !!isMember;

      case 'add_member':
      case 'remove_member':
      case 'update_member_role':
        // Only admins and managers can manage members
        return false;

      default:
        return false;
    }
  }

  /**
   * Check if user is team member
   */
  async isTeamMember(teamId: string, userId: string): Promise<boolean> {
    const member = await this.teamMemberRepository.findOne({
      where: {
        teamId,
        userId,
        leftDate: null
      },
    });

    return !!member;
  }

  /**
   * Check basic permission (simplified for now)
   */
  async checkPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles']
    });

    // Check if user has admin role
    if (user?.roles?.some(role => role.name === 'Admin')) {
      return true;
    }

    return false;
  }

  // ========== PRIVATE HELPER METHODS ==========

  private generateTeamCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `TEAM-${timestamp}-${random}`;
  }

  private async logTeamActivity(
    teamId: string,
    action: string,
    performedBy: string,
    details?: any
  ): Promise<void> {
    // Implement your audit logging logic here
    // This could save to an audit log table or external service
    console.log(`Team Activity: ${action} on team ${teamId} by ${performedBy}`, details);

    // Example implementation:
    // await this.auditLogService.log({
    //   entityType: 'Team',
    //   entityId: teamId,
    //   action,
    //   performedBy,
    //   details,
    //   timestamp: new Date(),
    // });
  }
}