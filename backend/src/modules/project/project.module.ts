import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { Project } from '../../database/entities/team-collaboration/project.entity';
import { Task } from '../../database/entities/team-collaboration/task.entity';
import { AccessRequest } from '../../database/entities/team-collaboration/access-request.entity';
import { Team } from '../../database/entities/team-collaboration/team.entity';
import { User } from '../../database/entities/core/user.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Project, Task, AccessRequest, Team, User]),
        NotificationModule,
    ],
    controllers: [ProjectController],
    providers: [ProjectService],
    exports: [ProjectService],
})
export class ProjectModule { }
