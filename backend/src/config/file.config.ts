import { registerAs } from '@nestjs/config';

export default registerAs('file', () => ({
  // Local storage
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
  ],
  
  // Storage type
  storageType: process.env.STORAGE_TYPE || 'local', // local, s3, azure, gcs
  
  // S3 configuration (if using AWS S3)
  s3Bucket: process.env.S3_BUCKET,
  s3Region: process.env.S3_REGION,
  s3AccessKey: process.env.S3_ACCESS_KEY,
  s3SecretKey: process.env.S3_SECRET_KEY,
  s3Endpoint: process.env.S3_ENDPOINT,
  
  // Azure Blob Storage
  azureConnectionString: process.env.AZURE_CONNECTION_STRING,
  azureContainer: process.env.AZURE_CONTAINER,
  
  // Google Cloud Storage
  gcsBucket: process.env.GCS_BUCKET,
  gcsKeyFilename: process.env.GCS_KEY_FILENAME,
  gcsProjectId: process.env.GCS_PROJECT_ID,
  
  // CDN
  cdnUrl: process.env.CDN_URL,
  
  // Image processing
  enableImageProcessing: process.env.ENABLE_IMAGE_PROCESSING === 'true',
  imageMaxWidth: parseInt(process.env.IMAGE_MAX_WIDTH || '1920', 10),
  imageMaxHeight: parseInt(process.env.IMAGE_MAX_HEIGHT || '1080', 10),
  imageQuality: parseInt(process.env.IMAGE_QUALITY || '85', 10),
}));