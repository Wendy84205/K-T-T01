// src/modules/team/team.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { Team } from '../../database/entities/team-collaboration/team.entity';
import { TeamMember } from '../../database/entities/team-collaboration/team-member.entity';
import { User } from '../../database/entities/core/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Team, TeamMember, User]),
  ],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}