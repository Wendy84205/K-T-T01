import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { FILE_CONSTANTS } from '../constants/app.constants';

@Injectable()
export class FileValidationPipe implements PipeTransform {
    transform(file: any) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        // Check size (max 50MB)
        if (file.size > FILE_CONSTANTS.MAX_FILE_SIZE) {
            throw new BadRequestException(`File is too large. Maximum size allowed: ${FILE_CONSTANTS.MAX_FILE_SIZE / (1024 * 1024)}MB`);
        }

        // Basic MIME type validation (security-sensitive)
        const allowedMimeTypes = FILE_CONSTANTS.ALLOWED_FILE_TYPES;
        const isAllowed = allowedMimeTypes.some(pattern => {
            if (pattern.endsWith('/*')) {
                const base = pattern.split('/')[0];
                return file.mimetype.startsWith(base + '/');
            }
            return file.mimetype === pattern;
        });

        if (!isAllowed) {
            throw new BadRequestException('Invalid file type');
        }

        return file;
    }
}
