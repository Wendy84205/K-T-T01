// src/modules/projects/projects.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectsService } from './projects.service';

@Controller('v1/projects')
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

  @Get(':id/tasks')
  findTasks(@Param('id') id: string) {
    return this.projectsService.findTasks(id);
  }

  @Post(':id/tasks')
  createTask(@Param('id') id: string, @Body() data: any) {
    return this.projectsService.createTask(id, data);
  }

  @Post('tasks/:id') // Using POST for update simplicity or PATCH
  updateTask(@Param('id') id: string, @Body() data: any) {
    return this.projectsService.updateTask(id, data);
  }
}
