import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../../database/entities/file-storage/file.entity';
import { Folder } from '../../database/entities/file-storage/folder.entity';
import { EncryptionService } from '../../common/service/encryption.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileStorageService {
    private readonly uploadDir = './uploads';

    constructor(
        @InjectRepository(File)
        private fileRepository: Repository<File>,
        @InjectRepository(Folder)
        private folderRepository: Repository<Folder>,
        private encryptionService: EncryptionService,
    ) {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async uploadFile(file: any, userId: string, folderId?: string): Promise<File> {
        const fileBuffer = file.buffer;
        const key = this.encryptionService.generateRandomKey();

        // Encrypt file
        const { encrypted, iv, tag } = this.encryptionService.encryptFile(fileBuffer, key);

        const fileHash = this.encryptionService.hashSHA256(fileBuffer);
        const filename = `${Date.now()}-${file.originalname}.enc`;
        const storagePath = path.join(this.uploadDir, filename);

        fs.writeFileSync(storagePath, encrypted);

        const newFile = this.fileRepository.create({
            name: file.originalname,
            originalName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size,
            storagePath,
            fileHash,
            checksum: fileHash, // Simplified
            ownerId: userId,
            folderId,
            isEncrypted: true,
            encryptionKeyId: key.toString('base64'), // Storing key in base64 for now
            metadata: {
                iv,
                tag,
                contentEncoding: 'aes-256-gcm'
            }
        });

        return this.fileRepository.save(newFile);
    }

    async downloadFile(fileId: string, userId: string): Promise<{ buffer: Buffer, metadata: File }> {
        const file = await this.getFileMetadata(fileId, userId);
        if (!fs.existsSync(file.storagePath)) throw new NotFoundException('Physical file not found');

        const encryptedBuffer = fs.readFileSync(file.storagePath);
        const key = Buffer.from(file.encryptionKeyId, 'base64');
        const { iv, tag } = file.metadata;

        const decrypted = this.encryptionService.decryptFile(encryptedBuffer, key, iv, tag);
        return { buffer: decrypted, metadata: file };
    }

    async getFileMetadata(fileId: string, userId: string): Promise<File> {
        const file = await this.fileRepository.findOne({ where: { id: fileId, ownerId: userId } });
        if (!file) throw new NotFoundException('File not found');
        return file;
    }

    async listFiles(userId: string, folderId?: string): Promise<File[]> {
        return this.fileRepository.find({ where: { ownerId: userId, folderId: folderId || null } });
    }

    async deleteFile(fileId: string, userId: string): Promise<void> {
        const file = await this.getFileMetadata(fileId, userId);
        if (fs.existsSync(file.storagePath)) {
            fs.unlinkSync(file.storagePath);
        }
        await this.fileRepository.remove(file);
    }
}