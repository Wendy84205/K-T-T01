// src/modules/projects/projects.controller.ts
import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectsService } from './projects.service';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Request() req) {
    return this.projectsService.findAll(req.user.userId);
  }

  @Get('tasks/my')
  findMyTasks(@Request() req) {
    return this.projectsService.findMyTasks(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Post()
  create(@Request() req, @Body() data: any) {
    return this.projectsService.create(req.user.userId, data);
  }

  @Delete(':id')
  deleteProject(@Param('id') id: string, @Request() req) {
    const roles = req.user.roles || [];
    const isAdmin = roles.includes('Admin') || roles.includes('Manager');
    return this.projectsService.deleteProject(id, req.user.userId, isAdmin);
  }

  @Get(':id/tasks')
  findTasks(@Param('id') id: string) {
    return this.projectsService.findTasks(id);
  }

  @Post(':id/tasks')
  createTask(@Param('id') id: string, @Body() data: any, @Request() req) {
    // Pass the creatorId so the service can include it in the notification
    return this.projectsService.createTask(id, data, req.user.userId);
  }

  @Post('tasks/:id')
  updateTask(@Param('id') id: string, @Body() data: any) {
    return this.projectsService.updateTask(id, data);
  }

  @Delete('tasks/:id')
  deleteTask(@Param('id') id: string, @Request() req) {
    const roles = req.user.roles || [];
    const isAdmin = roles.includes('Admin') || roles.includes('Manager');
    return this.projectsService.deleteTask(id, req.user.userId, isAdmin);
  }
}
