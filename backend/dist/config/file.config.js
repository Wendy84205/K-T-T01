"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('file', () => ({
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'text/plain',
    ],
    storageType: process.env.STORAGE_TYPE || 'local',
    s3Bucket: process.env.S3_BUCKET,
    s3Region: process.env.S3_REGION,
    s3AccessKey: process.env.S3_ACCESS_KEY,
    s3SecretKey: process.env.S3_SECRET_KEY,
    s3Endpoint: process.env.S3_ENDPOINT,
    azureConnectionString: process.env.AZURE_CONNECTION_STRING,
    azureContainer: process.env.AZURE_CONTAINER,
    gcsBucket: process.env.GCS_BUCKET,
    gcsKeyFilename: process.env.GCS_KEY_FILENAME,
    gcsProjectId: process.env.GCS_PROJECT_ID,
    cdnUrl: process.env.CDN_URL,
    enableImageProcessing: process.env.ENABLE_IMAGE_PROCESSING === 'true',
    imageMaxWidth: parseInt(process.env.IMAGE_MAX_WIDTH || '1920', 10),
    imageMaxHeight: parseInt(process.env.IMAGE_MAX_HEIGHT || '1080', 10),
    imageQuality: parseInt(process.env.IMAGE_QUALITY || '85', 10),
}));
//# sourceMappingURL=file.config.js.map