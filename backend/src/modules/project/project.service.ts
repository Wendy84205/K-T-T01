import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { Project } from '../../database/entities/team-collaboration/project.entity';
import { Task } from '../../database/entities/team-collaboration/task.entity';
import { AccessRequest } from '../../database/entities/team-collaboration/access-request.entity';
import { Team } from '../../database/entities/team-collaboration/team.entity';
import { User } from '../../database/entities/core/user.entity';
import { CreateProjectDto, UpdateProjectDto, CreateTaskDto, UpdateTaskDto, RequestAccessDto } from './dto/project.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ProjectService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @InjectRepository(AccessRequest)
        private readonly accessRequestRepository: Repository<AccessRequest>,
        @InjectRepository(Team)
        private readonly teamRepository: Repository<Team>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly notificationService: NotificationService,
    ) { }

    // Project management
    async createProject(dto: CreateProjectDto, userId: string): Promise<Project> {
        const project = this.projectRepository.create({
            ...dto,
            managerId: userId,
            status: dto.status || 'planned',
            priority: dto.priority || 'medium',
            securityLevel: dto.securityLevel || 2,
        });
        return await this.projectRepository.save(project);
    }

    async getProjects(userId: string, teamId?: string): Promise<Project[]> {
        const query = this.projectRepository.createQueryBuilder('project')
            .leftJoinAndSelect('project.team', 'team')
            .leftJoinAndSelect('project.manager', 'manager');

        if (teamId) {
            query.andWhere('project.teamId = :teamId', { teamId });
        }

        // Managers can see all projects in their team, or where they are managers
        // For now, let's return projects where the user is manager or in the team
        query.andWhere('(project.managerId = :userId OR project.isConfidential = false)', { userId });

        return await query.getMany();
    }

    async getProjectById(projectId: string, userId: string): Promise<Project> {
        const project = await this.projectRepository.findOne({
            where: { id: projectId },
            relations: ['team', 'manager'],
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // Basic access check
        if (project.isConfidential && project.managerId !== userId) {
            // Check if user has approved access request
            const access = await this.accessRequestRepository.findOne({
                where: {
                    resourceId: projectId,
                    userId: userId,
                    status: 'APPROVED',
                },
            });

            if (!access) {
                throw new ForbiddenException('You do not have access to this confidential project');
            }
        }

        return project;
    }

    async updateProject(projectId: string, updates: UpdateProjectDto, userId: string): Promise<Project> {
        const project = await this.getProjectById(projectId, userId);

        if (project.managerId !== userId) {
            throw new ForbiddenException('Only the project manager can update this project');
        }

        Object.assign(project, updates);
        return await this.projectRepository.save(project);
    }

    async deleteProject(projectId: string, userId: string): Promise<void> {
        const project = await this.getProjectById(projectId, userId);

        if (project.managerId !== userId) {
            throw new ForbiddenException('Only the project manager can delete this project');
        }

        await this.projectRepository.remove(project);
    }

    // Task management
    async createTask(projectId: string, dto: CreateTaskDto, reporterId: string): Promise<Task> {
        const project = await this.projectRepository.findOne({ where: { id: projectId } });
        if (!project) throw new NotFoundException('Project not found');

        const task = this.taskRepository.create({
            ...dto,
            projectId,
            reporterId,
            status: dto.status || 'todo',
            priority: dto.priority || 'medium',
        });

        const savedTask = await this.taskRepository.save(task);

        if (dto.assigneeId) {
            await this.notificationService.create({
                userId: dto.assigneeId,
                type: 'TASK_ASSIGNED',
                title: 'New Task Assigned',
                message: `You have been assigned to task: ${dto.title}`,
                data: { taskId: savedTask.id, projectId },
            });
        }

        return savedTask;
    }

    async getTasks(projectId: string): Promise<Task[]> {
        return await this.taskRepository.find({
            where: { projectId },
            relations: ['assignee', 'reporter'],
            order: { createdAt: 'DESC' },
        });
    }

    async updateTask(taskId: string, updates: UpdateTaskDto, userId: string): Promise<Task> {
        const task = await this.taskRepository.findOne({
            where: { id: taskId },
            relations: ['project'],
        });

        if (!task) throw new NotFoundException('Task not found');

        // Optimization: check permissions if needed

        const oldAssigneeId = task.assigneeId;
        Object.assign(task, updates);

        if (updates.status === 'done' && task.status !== 'done') {
            task.completedAt = new Date();
        }

        const savedTask = await this.taskRepository.save(task);

        if (updates.assigneeId && updates.assigneeId !== oldAssigneeId) {
            await this.notificationService.create({
                userId: updates.assigneeId,
                type: 'TASK_ASSIGNED',
                title: 'New Task Assigned',
                message: `You have been assigned to task: ${task.title}`,
                data: { taskId: savedTask.id, projectId: task.projectId },
            });
        }

        return savedTask;
    }

    async deleteTask(taskId: string, userId: string): Promise<void> {
        const task = await this.taskRepository.findOne({ where: { id: taskId } });
        if (!task) throw new NotFoundException('Task not found');
        await this.taskRepository.remove(task);
    }

    // Access requests
    async requestProjectAccess(projectId: string, userId: string, dto: RequestAccessDto): Promise<AccessRequest> {
        const project = await this.projectRepository.findOne({ where: { id: projectId } });
        if (!project) throw new NotFoundException('Project not found');

        const request = this.accessRequestRepository.create({
            userId,
            resourceType: 'project',
            resourceId: projectId,
            businessJustification: dto.businessJustification,
            durationMinutes: dto.durationMinutes || 60,
            status: 'PENDING',
            requestedPermission: 'view',
            ipAddress: '0.0.0.0', // Placeholder
        });

        const savedRequest = await this.accessRequestRepository.save(request);

        // Notify manager
        await this.notificationService.create({
            userId: project.managerId,
            type: 'ACCESS_REQUEST',
            title: 'Project Access Request',
            message: `A user has requested access to project: ${project.name}`,
            data: { requestId: savedRequest.id, projectId },
        });

        return savedRequest;
    }

    async approveAccessRequest(requestId: string, approverId: string, notes?: string): Promise<void> {
        const request = await this.accessRequestRepository.findOne({
            where: { id: requestId },
            relations: ['user']
        });
        if (!request) throw new NotFoundException('Request not found');

        request.status = 'APPROVED';
        request.approverId = approverId;
        request.approvedAt = new Date();
        request.approvalNotes = notes;

        if (request.durationMinutes) {
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + request.durationMinutes);
            request.expiresAt = expiresAt;
        }

        await this.accessRequestRepository.save(request);

        await this.notificationService.create({
            userId: request.userId,
            type: 'ACCESS_APPROVED',
            title: 'Access Request Approved',
            message: `Your request for project access has been approved.`,
            data: { requestId: request.id, resourceId: request.resourceId },
        });
    }
}
