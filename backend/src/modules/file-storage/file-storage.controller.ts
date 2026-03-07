import {
    Controller, Get, Post, Delete, Param, Query,
    UploadedFile, UseInterceptors, UseGuards, Request, Res, Body, ParseIntPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileStorageService } from './file-storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FileStorageController {
    constructor(private readonly fileStorageService: FileStorageService) { }

    // ─────────── Upload ───────────

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: any,
        @Request() req,
        @Body('changesDescription') changesDescription?: string,
    ) {
        return this.fileStorageService.uploadFile(file, req.user.userId, undefined, changesDescription);
    }

    // ─────────── List files (includes shared with you) ───────────

    @Get()
    async listFiles(@Request() req) {
        return this.fileStorageService.listFiles(req.user.userId);
    }

    @Get(':id')
    async getFile(@Param('id') id: string, @Request() req) {
        return this.fileStorageService.getFileMetadata(id, req.user.userId);
    }

    // ─────────── Sharing Management ───────────

    /** POST /files/:id/share — share file with another user */
    @Post(':id/share')
    async shareFile(
        @Param('id') id: string,
        @Body('targetUserId') targetUserId: string,
        @Body('permission') permission: string, // 'view', 'edit', 'admin'
        @Request() req,
    ) {
        return this.fileStorageService.shareFile(id, targetUserId, permission, req.user.userId);
    }

    /** GET /files/:id/shares — list who this file is shared with */
    @Get(':id/shares')
    async getShares(@Param('id') id: string, @Request() req) {
        return this.fileStorageService.getFileShares(id, req.user.userId);
    }

    /** DELETE /files/:id/shares/:shareId — revoke access */
    @Delete(':id/shares/:shareId')
    async revokeShare(
        @Param('id') id: string,
        @Param('shareId') shareId: string,
        @Request() req,
    ) {
        return this.fileStorageService.revokeShare(id, shareId, req.user.userId);
    }

    // ─────────── Download ───────────

    @Get(':id/download')
    async downloadFile(
        @Param('id') id: string,
        @Query('version') version: string,
        @Request() req,
        @Res() res: Response,
    ) {
        const versionNum = version ? parseInt(version, 10) : undefined;
        const { buffer, metadata } = await this.fileStorageService.downloadFile(id, req.user.userId, versionNum);

        const name = (metadata as any).name || (metadata as any).originalName || 'download';
        const mime = (metadata as any).mimeType || 'application/octet-stream';

        res.setHeader('Content-Type', mime);
        res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
        res.setHeader('Content-Length', buffer.length);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
        res.end(buffer);
    }

    // ─────────── Integrity check ───────────

    @Post(':id/verify')
    async verifyIntegrity(@Param('id') id: string, @Request() req) {
        return this.fileStorageService.verifyFileIntegrity(id, req.user.userId);
    }

    // ─────────── VERSION HISTORY ───────────

    @Get(':id/versions')
    async getVersions(@Param('id') id: string, @Request() req) {
        return this.fileStorageService.getFileVersions(id, req.user.userId);
    }

    @Post(':id/versions/:v/restore')
    async restoreVersion(
        @Param('id') id: string,
        @Param('v', ParseIntPipe) versionNumber: number,
        @Request() req,
    ) {
        return this.fileStorageService.restoreVersion(id, versionNumber, req.user.userId);
    }

    @Delete(':id/versions/:v')
    async deleteVersion(
        @Param('id') id: string,
        @Param('v', ParseIntPipe) versionNumber: number,
        @Request() req,
    ) {
        return this.fileStorageService.deleteVersion(id, versionNumber, req.user.userId);
    }

    // ─────────── Delete file ───────────

    @Delete(':id')
    async deleteFile(@Param('id') id: string, @Request() req) {
        return this.fileStorageService.deleteFile(id, req.user.userId);
    }
}
