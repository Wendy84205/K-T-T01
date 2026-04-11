// src/modules/projects/projects.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from '../../database/entities/team-collaboration/project.entity';
import { ProjectTask } from '../../database/entities/team-collaboration/project-task.entity';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ProjectTask)
    private taskRepository: Repository<ProjectTask>,
    private readonly chatGateway: ChatGateway,
  ) {}

  async findAll(userId: string): Promise<Project[]> {
    // Use raw UNION SQL: find all project IDs the user is involved in
    // (creator, has assigned tasks, or is team member)
    const rows: any[] = await this.projectRepository.query(`
      SELECT DISTINCT p.id FROM projects p WHERE p.creator_id = ?
      UNION
      SELECT DISTINCT pt.project_id FROM project_tasks pt WHERE pt.assignee_id = ?
      UNION
      SELECT DISTINCT p2.id FROM projects p2
        INNER JOIN teams t ON t.id = p2.team_id
        INNER JOIN team_members tm ON tm.team_id = t.id
        WHERE tm.user_id = ?
    `, [userId, userId, userId]);

    if (rows.length === 0) return [];

    const projectIds = rows.map(r => r.id);

    return this.projectRepository.find({
      where: { id: In(projectIds) },
      relations: ['tasks'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['tasks', 'tasks.assignee'],
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(userId: string, data: any): Promise<Project> {
    const saved = await this.projectRepository.create({
      ...data,
      creatorId: userId,
    });
    const result = await this.projectRepository.save(saved);
    return result as unknown as Project;
  }

  async deleteProject(id: string, userId: string, isAdmin: boolean = false): Promise<void> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');

    if (project.creatorId !== userId && !isAdmin) {
      throw new Error('Unauthorized to delete this project');
    }

    // Since we mapped project_tasks to Cascade remove/delete or TypeORM remove on Project Entity handles it, 
    // it's safer to just do remove(project) which removes the project.
    // If cascade is not set, we might need to physically delete tasks first:
    await this.taskRepository.delete({ projectId: id });
    await this.projectRepository.remove(project);
    
    // Notify members?
  }

  async findTasks(projectId: string): Promise<ProjectTask[]> {
    return this.taskRepository.find({
      where: { projectId },
      relations: ['assignee'],
      order: { createdAt: 'ASC' },
    });
  }

  async createTask(projectId: string, data: any, creatorId?: string): Promise<ProjectTask> {
    const task = this.taskRepository.create({
      ...data,
      projectId,
    });
    const saved = await this.taskRepository.save(task) as unknown as ProjectTask;

    // Load full task with relations to get assignee info for notification
    const fullTask = await this.taskRepository.findOne({
      where: { id: saved.id },
      relations: ['assignee', 'project'],
    });

    // 🔔 Emit Socket.IO notification to the assigned user
    if (fullTask?.assigneeId) {
      const projectName = fullTask.project?.name || 'Unknown Project';
      const taskTitle = fullTask.title;

      console.log(`[Projects] Notifying user ${fullTask.assigneeId} of new task: ${taskTitle}`);

      // Emit to the user's personal socket room (user_{userId})
      this.chatGateway.server.to(`user_${fullTask.assigneeId}`).emit('task-assigned', {
        type: 'TASK_ASSIGNED',
        task: {
          id: fullTask.id,
          title: taskTitle,
          priority: fullTask.priority,
          dueDate: fullTask.dueDate,
          status: fullTask.status,
        },
        project: {
          id: projectId,
          name: projectName,
        },
        assignedBy: creatorId || null,
        message: `You have been assigned a new task: "${taskTitle}" in project "${projectName}"`,
        createdAt: new Date().toISOString(),
      });

      // Also emit as a generic notification event to trigger the notification bell
      this.chatGateway.server.to(`user_${fullTask.assigneeId}`).emit('notification', {
        type: 'TASK_ASSIGNED',
        title: '📋 New Task Assigned',
        message: `"${taskTitle}" — ${projectName}`,
        taskId: fullTask.id,
        projectId,
        createdAt: new Date().toISOString(),
      });
    }

    return fullTask || (saved as unknown as ProjectTask);
  }

  async findMyTasks(userId: string): Promise<ProjectTask[]> {
    return this.taskRepository.find({
      where: { assigneeId: userId },
      relations: ['project'],
      order: { dueDate: 'ASC', createdAt: 'DESC' },
    });
  }

  async updateTask(taskId: string, data: any): Promise<ProjectTask> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['project'],
    });
    if (!task) throw new NotFoundException('Task not found');

    // Handle progressNote: save with timestamp
    if (data.progressNote !== undefined && data.progressNote !== null && data.progressNote.trim() !== '') {
      task.progressNote = data.progressNote.trim();
      task.lastProgressNoteAt = new Date();

      // 🔔 Notify the project creator/manager about the progress report
      const projectCreatorId = task.project?.creatorId;
      if (projectCreatorId && projectCreatorId !== task.assigneeId) {
        this.chatGateway.server.to(`user_${projectCreatorId}`).emit('notification', {
          type: 'TASK_PROGRESS_REPORT',
          title: '📊 Progress Report Received',
          message: `Task "${task.title}": ${task.progressNote}`,
          taskId,
          projectId: task.projectId,
          createdAt: new Date().toISOString(),
        });
      }

      // Remove progressNote from data so it doesn't double-assign
      const { progressNote, ...rest } = data;
      Object.assign(task, rest);
    } else {
      // Normal update (status change, etc.)
      const { progressNote, ...rest } = data;
      Object.assign(task, rest);
    }

    const saved = await this.taskRepository.save(task);
    return saved as unknown as ProjectTask;
  }

  async deleteTask(taskId: string, userId: string, isAdmin: boolean = false): Promise<void> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['project'],
    });
    if (!task) throw new NotFoundException('Task not found');

    const isCreator = task.project?.creatorId === userId;
    const isAssignee = task.assigneeId === userId;

    if (!isCreator && !isAdmin && !isAssignee) {
      throw new Error('Unauthorized to delete this task');
    }

    // 🔔 Notify assignee if someone else deletes it
    if (task.assigneeId && task.assigneeId !== userId) {
      this.chatGateway.server.to(`user_${task.assigneeId}`).emit('notification', {
        type: 'TASK_DELETED',
        title: '🗑️ Task Deleted',
        message: `The task "${task.title}" was deleted.`,
        taskId: task.id,
        createdAt: new Date().toISOString(),
      });
    }

    await this.taskRepository.remove(task);
  }
}
