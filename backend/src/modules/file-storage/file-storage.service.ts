import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { File } from '../../database/entities/file-storage/file.entity';
import { Folder } from '../../database/entities/file-storage/folder.entity';
import { FileVersion } from '../../database/entities/file-storage/file-version.entity';
import { FileShare } from '../../database/entities/file-storage/file-share.entity';
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
        @InjectRepository(FileVersion)
        private fileVersionRepository: Repository<FileVersion>,
        @InjectRepository(FileShare)
        private fileShareRepository: Repository<FileShare>,
        private encryptionService: EncryptionService,
    ) {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    // ─────────────────── ACCESS CONTROL HELPER ───────────────────

    /** 
     * Verifies if a user has permission for a specific file action.
     * Actions: 'view', 'edit', 'delete', 'share', 'admin' (all)
     */
    async checkAccess(fileId: string, userId: string, action: 'view' | 'edit' | 'delete' | 'share' | 'admin' = 'view'): Promise<File> {
        const file = await this.fileRepository.findOne({ where: { id: fileId } });
        if (!file) throw new NotFoundException('File not found');

        // Owner always has full access
        if (file.ownerId === userId) return file;

        // Check for share entry
        const share = await this.fileShareRepository.findOne({
            where: {
                fileId,
                sharedWithId: userId,
                isActive: true
            }
        });

        if (!share) {
            throw new ForbiddenException('Access denied. File is not shared with you.');
        }

        // Logic check for specific levels
        const level = share.permissionLevel.toLowerCase(); // 'view', 'edit', 'admin' etc

        if (action === 'view') return file; // Sharing at all implies view access

        if (action === 'edit' && ['edit', 'admin', 'manage'].includes(level)) return file;

        if (action === 'admin' || action === 'delete' || action === 'share') {
            if (level === 'admin' || level === 'manage') return file;
            throw new ForbiddenException(`Insufficient permissions to ${action} this file.`);
        }

        throw new ForbiddenException('Access denied.');
    }

    // ─────────────────── SHARING LOGIC ───────────────────

    async shareFile(fileId: string, targetUserId: string, permissionLevel: string, ownerId: string): Promise<FileShare> {
        await this.checkAccess(fileId, ownerId, 'share');

        // Check if already shared
        let share = await this.fileShareRepository.findOne({
            where: { fileId, sharedWithId: targetUserId }
        });

        if (share) {
            share.permissionLevel = permissionLevel;
            share.isActive = true;
            return this.fileShareRepository.save(share);
        }

        share = this.fileShareRepository.create({
            fileId,
            sharedWithId: targetUserId,
            permissionLevel,
            sharedBy: ownerId,
            sharedWithType: 'user'
        });

        return this.fileShareRepository.save(share);
    }

    async getFileShares(fileId: string, userId: string): Promise<any[]> {
        await this.checkAccess(fileId, userId, 'view');
        // Fetch shares with user details if possible (simplified for now)
        return this.fileShareRepository.find({ where: { fileId, isActive: true } });
    }

    async revokeShare(fileId: string, shareId: string, userId: string): Promise<void> {
        await this.checkAccess(fileId, userId, 'share');
        const share = await this.fileShareRepository.findOne({ where: { id: shareId, fileId } });
        if (!share) throw new NotFoundException('Share record not found');
        share.isActive = false;
        await this.fileShareRepository.save(share);
    }

    // ─────────────────── UPLOAD / LISTING (modified for shares) ───────────────────

    async listFiles(userId: string): Promise<File[]> {
        // Find files you own
        const owned = await this.fileRepository.find({ where: { ownerId: userId } });

        // Find files shared with you
        const sharedEntries = await this.fileShareRepository.find({
            where: { sharedWithId: userId, isActive: true },
            relations: ['file']
        });

        const shared = sharedEntries.map(s => s.file).filter(f => !!f);

        // Combined unique list
        const fileMap = new Map();
        [...owned, ...shared].forEach(f => fileMap.set(f.id, f));
        return Array.from(fileMap.values());
    }

    async uploadFile(file: any, userId: string, folderId?: string, changesDescription?: string): Promise<File> {
        const fileBuffer = file.buffer;
        const key = this.encryptionService.generateRandomKey();

        const { encrypted, iv, tag } = this.encryptionService.encryptFile(fileBuffer, key);
        const fileHash = this.encryptionService.hashSHA256(fileBuffer);
        const filename = `${Date.now()}-${file.originalname}.enc`;
        const storagePath = path.join(this.uploadDir, filename);

        fs.writeFileSync(storagePath, encrypted);

        // Check if file with same name exists for this user (OWNER)
        // Note: Sharing could allow overwriting if we check access by name instead of ID, but simplified for owner-only brand-new file.
        const existingFile = await this.fileRepository.findOne({
            where: { originalName: file.originalname, ownerId: userId },
        });

        if (existingFile) {
            // Snapshot current version (from previous implementation)
            const snapshot = this.fileVersionRepository.create({
                fileId: existingFile.id,
                versionNumber: existingFile.versionNumber,
                storagePath: existingFile.storagePath,
                sizeBytes: existingFile.sizeBytes,
                fileHash: existingFile.fileHash,
                encryptionKeyId: existingFile.encryptionKeyId,
                metadata: existingFile.metadata,
                changesDescription: changesDescription || `Superseded by v${existingFile.versionNumber + 1}`,
                changedBy: userId,
            });
            await this.fileVersionRepository.save(snapshot);

            existingFile.storagePath = storagePath;
            existingFile.sizeBytes = file.size;
            existingFile.fileHash = fileHash;
            existingFile.checksum = fileHash;
            existingFile.encryptionKeyId = key.toString('base64');
            existingFile.versionNumber = existingFile.versionNumber + 1;
            existingFile.metadata = { iv, tag, contentEncoding: 'aes-256-gcm' };

            return this.fileRepository.save(existingFile);
        }

        const newFile = this.fileRepository.create({
            name: file.originalname,
            originalName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size,
            storagePath,
            fileHash,
            checksum: fileHash,
            ownerId: userId,
            folderId,
            isEncrypted: true,
            encryptionKeyId: key.toString('base64'),
            versionNumber: 1,
            isLatestVersion: true,
            metadata: { iv, tag, contentEncoding: 'aes-256-gcm' },
        });

        return this.fileRepository.save(newFile);
    }

    async downloadFile(fileId: string, userId: string, versionNumber?: number): Promise<{ buffer: Buffer; metadata: File | FileVersion }> {
        const file = await this.checkAccess(fileId, userId, 'view');

        if (versionNumber && versionNumber !== file.versionNumber) {
            const version = await this.fileVersionRepository.findOne({ where: { fileId, versionNumber } });
            if (!version) throw new NotFoundException(`Version ${versionNumber} not found`);
            if (!fs.existsSync(version.storagePath)) throw new NotFoundException('Physical file not found');
            const encryptedBuffer = fs.readFileSync(version.storagePath);
            const key = Buffer.from(version.encryptionKeyId, 'base64');
            const { iv, tag } = (version.metadata as any) || {};
            if (!iv || !tag) throw new Error('Incomplete encryption metadata for this version');
            const decrypted = this.encryptionService.decryptFile(encryptedBuffer, key, iv, tag);
            return { buffer: decrypted, metadata: version };
        }

        if (!fs.existsSync(file.storagePath)) throw new NotFoundException('Physical file not found');
        const encryptedBuffer = fs.readFileSync(file.storagePath);
        const key = Buffer.from(file.encryptionKeyId, 'base64');
        const { iv, tag } = file.metadata;
        const decrypted = this.encryptionService.decryptFile(encryptedBuffer, key, iv, tag);
        return { buffer: decrypted, metadata: file };
    }

    async getFileVersions(fileId: string, userId: string): Promise<{ current: File; versions: FileVersion[]; totalVersions: number; }> {
        const file = await this.checkAccess(fileId, userId, 'view');

        const versions = await this.fileVersionRepository.find({
            where: { fileId },
            order: { versionNumber: 'DESC' },
        });

        return { current: file, versions, totalVersions: versions.length + 1 };
    }

    async restoreVersion(fileId: string, versionNumber: number, userId: string): Promise<File> {
        // Need 'edit' or 'owner' permission to restore
        const file = await this.checkAccess(fileId, userId, 'edit');

        const targetVersion = await this.fileVersionRepository.findOne({ where: { fileId, versionNumber } });
        if (!targetVersion) throw new NotFoundException(`Version ${versionNumber} not found`);

        const snapshot = this.fileVersionRepository.create({
            fileId: file.id, versionNumber: file.versionNumber, storagePath: file.storagePath, sizeBytes: file.sizeBytes,
            fileHash: file.fileHash, encryptionKeyId: file.encryptionKeyId, metadata: file.metadata,
            changesDescription: `Auto-snapshot before restoring v${versionNumber}`,
            changedBy: userId,
        });
        await this.fileVersionRepository.save(snapshot);

        file.storagePath = targetVersion.storagePath;
        file.sizeBytes = targetVersion.sizeBytes;
        file.fileHash = targetVersion.fileHash;
        file.encryptionKeyId = targetVersion.encryptionKeyId;
        file.metadata = targetVersion.metadata;
        file.versionNumber = file.versionNumber + 1;

        return this.fileRepository.save(file);
    }

    async deleteVersion(fileId: string, versionNumber: number, userId: string): Promise<any> {
        const file = await this.checkAccess(fileId, userId, 'delete');
        if (versionNumber === file.versionNumber) throw new ForbiddenException('Cannot delete current version');

        const version = await this.fileVersionRepository.findOne({ where: { fileId, versionNumber } });
        if (!version) throw new NotFoundException(`Version ${versionNumber} not found`);

        if (version.storagePath !== file.storagePath && fs.existsSync(version.storagePath)) {
            fs.unlinkSync(version.storagePath);
        }
        await this.fileVersionRepository.remove(version);
        return { success: true };
    }

    async getFileMetadata(fileId: string, userId: string): Promise<File> {
        return this.checkAccess(fileId, userId, 'view');
    }

    async deleteFile(fileId: string, userId: string): Promise<void> {
        const file = await this.checkAccess(fileId, userId, 'delete');

        // Cleanup shares
        await this.fileShareRepository.delete({ fileId });

        // Cleanup versions
        const versions = await this.fileVersionRepository.find({ where: { fileId } });
        for (const v of versions) {
            if (v.storagePath !== file.storagePath && fs.existsSync(v.storagePath)) {
                fs.unlinkSync(v.storagePath);
            }
        }
        await this.fileVersionRepository.delete({ fileId });

        // Physical cleanup
        if (fs.existsSync(file.storagePath)) fs.unlinkSync(file.storagePath);
        await this.fileRepository.remove(file);
    }

    async verifyFileIntegrity(fileId: string, userId: string): Promise<any> {
        const file = await this.checkAccess(fileId, userId, 'view');
        if (!fs.existsSync(file.storagePath)) throw new NotFoundException('Physical file not found');

        const { buffer } = await this.downloadFile(fileId, userId);
        const currentHash = this.encryptionService.hashSHA256(buffer);
        const isValid = currentHash === file.fileHash;

        return { isValid, originalHash: file.fileHash, currentHash, verifiedAt: new Date(), fileName: file.name, currentVersion: file.versionNumber };
    }
}