import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class EncryptionValidationPipe implements PipeTransform {
    transform(value: any) {
        // Basic verification for encrypted payload (often contains ciphertext, iv, and tag)
        // For chat or sensitive data
        if (!value || typeof value !== 'object') {
            return value;
        }

        // Identify if it's an encrypted message structure
        const isEncrypted = value.encrypted || value.ciphertext;

        if (isEncrypted) {
            if (!value.iv) {
                throw new BadRequestException('Encryption payload missing IV (Initialization Vector)');
            }
            if (!value.tag && !value.authTag) {
                throw new BadRequestException('Encryption payload missing authentication tag');
            }
        }

        return value;
    }
}
