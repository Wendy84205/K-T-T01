import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { SecurityUtils } from '../../utils/security.utils';

@Injectable()
export class SecurityValidationPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (!value || typeof value !== 'object') {
            return value;
        }

        // Iterate over keys and sanitize strings
        const sanitized = { ...value };
        for (const key of Object.keys(sanitized)) {
            if (typeof sanitized[key] === 'string') {
                // Check for SQL injection patterns
                if (SecurityUtils.detectSQLInjection(sanitized[key])) {
                    throw new BadRequestException(`Malicious pattern detected in field: ${key}`);
                }
                // Basic XSS sanitization
                sanitized[key] = SecurityUtils.sanitizeInput(sanitized[key]);
            }
        }

        return sanitized;
    }
}
