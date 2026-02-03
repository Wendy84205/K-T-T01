import { Controller, Get, Post, Delete, Param, UploadedFile, UseInterceptors, UseGuards, Request, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileStorageService } from './file-storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FileStorageController {
    constructor(private readonly fileStorageService: FileStorageService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: any, @Request() req) {
        return this.fileStorageService.uploadFile(file, req.user.userId);
    }

    @Get()
    async listFiles(@Request() req) {
        return this.fileStorageService.listFiles(req.user.userId);
    }

    @Get(':id')
    async getFile(@Param('id') id: string, @Request() req) {
        return this.fileStorageService.getFileMetadata(id, req.user.userId);
    }

    @Get(':id/download')
    async downloadFile(@Param('id') id: string, @Request() req, @Res() res: Response) {
        const { buffer, metadata } = await this.fileStorageService.downloadFile(id, req.user.userId);

        res.setHeader('Content-Type', metadata.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${metadata.name}"`);
        res.setHeader('Content-Length', buffer.length);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

        res.end(buffer);
    }

    @Delete(':id')
    async deleteFile(@Param('id') id: string, @Request() req) {
        return this.fileStorageService.deleteFile(id, req.user.userId);
    }
}
