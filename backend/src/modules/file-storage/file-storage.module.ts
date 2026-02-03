import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileStorageController } from './file-storage.controller';
import { FileStorageService } from './file-storage.service';
import { File } from '../../database/entities/file-storage/file.entity';
import { Folder } from '../../database/entities/file-storage/folder.entity';
import { EncryptionService } from '../../common/service/encryption.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([File, Folder]),
    ],
    controllers: [FileStorageController],
    providers: [FileStorageService, EncryptionService],
    exports: [FileStorageService],
})
export class FileStorageModule { }
