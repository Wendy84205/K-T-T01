// TODO: File Utilities Implementation
// 1. File extension extraction
//    - getFileExtension(filename: string): string
//    - Extract extension from filename
//    - Handle multiple dots in filename
//    - Return lowercase extension
// 2. Filename sanitization
//    - sanitizeFilename(filename: string): string
//    - Remove special characters
//    - Replace spaces with underscores
//    - Prevent path traversal (../)
//    - Limit filename length
// 3. File hash calculation
//    - calculateFileHash(buffer: Buffer, algorithm?: string): string
//    - Support SHA-256, MD5, SHA-1
//    - Return hex-encoded hash
//    - Use for file integrity checks
// 4. File type validation
//    - validateFileType(mimetype: string, allowedTypes: string[]): boolean
//    - Check MIME type against whitelist
//    - Validate file signature (magic bytes)
//    - Prevent MIME type spoofing
// 5. Image compression (optional)
//    - compressImage(buffer: Buffer, quality?: number): Promise<Buffer>
//    - Use sharp library
//    - Resize large images
//    - Optimize for web
// 6. Unique filename generation
//    - generateUniqueFilename(originalName: string): string
//    - Add timestamp or UUID
//    - Preserve original extension
//    - Ensure uniqueness
// 7. Additional file utilities
//    - getFileSizeFormatted(bytes: number): string (e.g., "1.5 MB")
//    - getMimeTypeFromExtension(extension: string): string
//    - isImageFile(mimetype: string): boolean
//    - isVideoFile(mimetype: string): boolean
//    - isPDFFile(mimetype: string): boolean