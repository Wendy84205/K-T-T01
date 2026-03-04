import * as path from 'path';
import * as crypto from 'crypto';

export class FileUtils {
    /**
     * Extract extension from filename (lowercase)
     */
    static getFileExtension(filename: string): string {
        const ext = path.extname(filename || '').toLowerCase();
        return ext.startsWith('.') ? ext.slice(1) : ext;
    }

    /**
     * Remove special characters and replace spaces with underscores
     */
    static sanitizeFilename(filename: string): string {
        if (!filename) return 'unnamed_file';

        // Split name and extension
        const ext = this.getFileExtension(filename);
        const base = path.basename(filename, '.' + ext);

        // Sanitize base name
        const sanitizedBase = base
            .replace(/[^a-zA-Z0-9]/g, '_')
            .replace(/_{2,}/g, '_')
            .slice(0, 50); // Limit length

        return (sanitizedBase || 'file') + (ext ? '.' + ext : '');
    }

    /**
     * Calculate SHA-256 hash of a buffer
     */
    static calculateFileHash(buffer: Buffer, algorithm: string = 'sha256'): string {
        return crypto.createHash(algorithm).update(buffer).digest('hex');
    }

    /**
     * Generate a unique filename with UUID and timestamp
     */
    static generateUniqueFilename(originalName: string): string {
        const ext = this.getFileExtension(originalName);
        const sanitized = this.sanitizeFilename(originalName);
        const base = path.basename(sanitized, '.' + ext);
        const uniqueId = crypto.randomUUID().slice(0, 8);
        const timestamp = Date.now();

        return `${base}_${timestamp}_${uniqueId}${ext ? '.' + ext : ''}`;
    }

    /**
     * Format bytes into human readable size (KB, MB, GB)
     */
    static getFileSizeFormatted(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static isImageFile(mimetype: string): boolean {
        return mimetype.startsWith('image/');
    }

    static isPDFFile(mimetype: string): boolean {
        return mimetype === 'application/pdf';
    }
}