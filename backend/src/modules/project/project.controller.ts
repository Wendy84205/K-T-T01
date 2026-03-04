import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, Req } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto, CreateTaskDto, UpdateTaskDto, RequestAccessDto } from './dto/project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('v1/projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
    constructor(private readonly projectService: ProjectService) { }

    @Post()
    async createProject(@Body() dto: CreateProjectDto, @Req() req: any) {
        const userId = req.user.id;
        return this.projectService.createProject(dto, userId);
    }

    @Get()
    async getProjects(@Query('teamId') teamId: string, @Req() req: any) {
        const userId = req.user.id;
        return this.projectService.getProjects(userId, teamId);
    }

    @Get(':id')
    async getProjectById(@Param('id') projectId: string, @Req() req: any) {
        const userId = req.user.id;
        return this.projectService.getProjectById(projectId, userId);
    }

    @Put(':id')
    async updateProject(
        @Param('id') projectId: string,
        @Body() updates: UpdateProjectDto,
        @Req() req: any,
    ) {
        const userId = req.user.id;
        return this.projectService.updateProject(projectId, updates, userId);
    }

    @Delete(':id')
    async deleteProject(@Param('id') projectId: string, @Req() req: any) {
        const userId = req.user.id;
        return this.projectService.deleteProject(projectId, userId);
    }

    // Task endpoints
    @Post(':id/tasks')
    async createTask(
        @Param('id') projectId: string,
        @Body() dto: CreateTaskDto,
        @Req() req: any,
    ) {
        const userId = req.user.id;
        return this.projectService.createTask(projectId, dto, userId);
    }

    @Get(':id/tasks')
    async getTasks(@Param('id') projectId: string) {
        return this.projectService.getTasks(projectId);
    }

    @Put('tasks/:taskId')
    async updateTask(
        @Param('taskId') taskId: string,
        @Body() updates: UpdateTaskDto,
        @Req() req: any,
    ) {
        const userId = req.user.id;
        return this.projectService.updateTask(taskId, updates, userId);
    }

    @Delete('tasks/:taskId')
    async deleteTask(@Param('taskId') taskId: string, @Req() req: any) {
        const userId = req.user.id;
        return this.projectService.deleteTask(taskId, userId);
    }

    // Access requests
    @Post(':id/access-requests')
    async requestAccess(
        @Param('id') projectId: string,
        @Body() dto: RequestAccessDto,
        @Req() req: any,
    ) {
        const userId = req.user.id;
        return this.projectService.requestProjectAccess(projectId, userId, dto);
    }

    @Put('access-requests/:id/approve')
    async approveRequest(
        @Param('id') requestId: string,
        @Body() body: { notes?: string },
        @Req() req: any,
    ) {
        const userId = req.user.id;
        return this.projectService.approveAccessRequest(requestId, userId, body.notes);
    }
}
