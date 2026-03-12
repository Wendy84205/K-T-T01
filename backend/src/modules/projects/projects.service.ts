// src/modules/projects/projects.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../database/entities/team-collaboration/project.entity';
import { ProjectTask } from '../../database/entities/team-collaboration/project-task.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ProjectTask)
    private taskRepository: Repository<ProjectTask>,
  ) {}

  async findAll(userId: string): Promise<Project[]> {
    return this.projectRepository.find({
      where: [{ creatorId: userId }, { team: { members: { userId } } }],
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
    const project = this.projectRepository.create({
      ...data,
      creatorId: userId,
    });
    const saved = await this.projectRepository.save(project);
    return saved as unknown as Project;
  }

  async findTasks(projectId: string): Promise<ProjectTask[]> {
    return this.taskRepository.find({
      where: { projectId },
      relations: ['assignee'],
      order: { createdAt: 'ASC' },
    });
  }

  async createTask(projectId: string, data: any): Promise<ProjectTask> {
    const task = this.taskRepository.create({
      ...data,
      projectId,
    });
    const saved = await this.taskRepository.save(task);
    return saved as unknown as ProjectTask;
  }

  async findMyTasks(userId: string): Promise<ProjectTask[]> {
    return this.taskRepository.find({
      where: { assigneeId: userId },
      relations: ['project'],
      order: { dueDate: 'ASC', createdAt: 'DESC' },
    });
  }

  async updateTask(taskId: string, data: any): Promise<ProjectTask> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    
    Object.assign(task, data);
    const saved = await this.taskRepository.save(task);
    return saved as unknown as ProjectTask;
  }
}
