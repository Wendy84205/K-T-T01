// src/modules/team/team.controller.ts
import {
  Controller, Get, Post, Put, Delete, Body,
  Param, UseGuards, Request
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamService } from './team.service';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) { }

  @Post()
  async createTeam(
    @Request() req,
    @Body() createTeamDto: any // TODO: Tạo CreateTeamDto
  ) {
    return this.teamService.createTeam(
      createTeamDto.name,
      req.user.userId,
      createTeamDto
    );
  }

  @Get()
  async getAllTeams() {
    return this.teamService.getAllTeams();
  }

  @Get(':id')
  async getTeamById(@Param('id') id: string) {
    return this.teamService.getTeamById(id);
  }

  @Get(':id/members')
  async getTeamMembers(@Param('id') id: string) {
    return this.teamService.getTeamMembers(id);
  }

  @Post(':id/members')
  async addTeamMember(
    @Param('id') teamId: string,
    @Request() req,
    @Body() addMemberDto: any // TODO: Tạo AddMemberDto
  ) {
    return this.teamService.addTeamMember(
      teamId,
      addMemberDto.userId,
      addMemberDto.role,
      req.user.userId
    );
  }

  @Put(':id/members/:userId')
  async updateTeamMemberRole(
    @Param('id') teamId: string,
    @Param('userId') userId: string,
    @Request() req,
    @Body() updateRoleDto: { role: string }
  ) {
    return this.teamService.updateTeamMemberRole(
      teamId,
      userId,
      updateRoleDto.role,
      req.user.userId
    );
  }

  @Delete(':id/members/:userId')
  async removeTeamMember(
    @Param('id') teamId: string,
    @Param('userId') userId: string,
    @Request() req
  ) {
    return this.teamService.removeTeamMember(
      teamId,
      userId,
      req.user.userId
    );
  }

  @Delete(':id')
  async deleteTeam(
    @Param('id') id: string,
    @Request() req
  ) {
    return this.teamService.deleteTeam(id, req.user.userId);
  }
}