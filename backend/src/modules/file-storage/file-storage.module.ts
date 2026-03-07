import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileStorageController } from './file-storage.controller';
import { FileStorageService } from './file-storage.service';
import { File } from '../../database/entities/file-storage/file.entity';
import { Folder } from '../../database/entities/file-storage/folder.entity';
import { FileVersion } from '../../database/entities/file-storage/file-version.entity';
import { FileShare } from '../../database/entities/file-storage/file-share.entity';
import { EncryptionService } from '../../common/service/encryption.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([File, Folder, FileVersion, FileShare]),
    ],
    controllers: [FileStorageController],
    providers: [FileStorageService, EncryptionService],
    exports: [FileStorageService],
})
export class FileStorageModule { }
