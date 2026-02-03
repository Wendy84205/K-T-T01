import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Manager')
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    console.log(`[DEBUG] UsersController.findAll hit:`, { page, limit, role, status, search });
    return this.usersService.findAll({ page, limit, role, status, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Manager')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Manager')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: any) {
    const currentUserId = req.user?.userId;
    return this.usersService.update(id, updateUserDto, currentUserId);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Manager')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.usersService.updateStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Manager')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Delete(':id/purge')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  purge(@Param('id') id: string) {
    return this.usersService.hardDelete(id);
  }

  @Post(':id/reset-password')
  @Roles('Admin')
  resetPassword(@Param('id') id: string) {
    return this.usersService.resetPassword(id);
  }

  @Post('bulk-status')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  bulkUpdateStatus(@Body() body: { ids: string[], status: string }) {
    return this.usersService.bulkUpdateStatus(body.ids, body.status);
  }

  @Post('global-lockdown')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  globalLockdown() {
    return this.usersService.globalLockdown();
  }
}