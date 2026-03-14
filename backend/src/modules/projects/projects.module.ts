// src/modules/projects/projects.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../../database/entities/team-collaboration/project.entity';
import { ProjectTask } from '../../database/entities/team-collaboration/project-task.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectTask]),
    ChatModule,
  ],
  providers: [ProjectsService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
