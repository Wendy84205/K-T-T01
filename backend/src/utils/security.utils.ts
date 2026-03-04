import * as crypto from 'crypto';

export class SecurityUtils {
    /**
     * Check password strength and return a numeric score (0-4)
     */
    static getPasswordStrength(password: string): { score: number; feedback: string[] } {
        let score = 0;
        const feedback: string[] = [];

        if (password.length >= 8) score++; else feedback.push('Password too short');
        if (/[A-Z]/.test(password)) score++; else feedback.push('Add uppercase letter');
        if (/[a-z]/.test(password)) score++; else feedback.push('Add lowercase letter');
        if (/\d/.test(password)) score++; else feedback.push('Add a number');
        if (/[@$!%*?&]/.test(password)) score++; else feedback.push('Add special character');

        return { score: Math.min(score, 4), feedback };
    }

    /**
     * Basic XSS sanitization (remove script tags and most problematic HTML)
     */
    static sanitizeInput(input: string): string {
        if (typeof input !== 'string') return input;
        return input
            .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, '[REMOVED_SCRIPT]')
            .replace(/<[^>]+>/gm, '') // Remove all HTML tags
            .trim();
    }

    /**
     * Secure random string generation for keys/tokens
     */
    static generateSecureRandomString(length: number = 32): string {
        return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
    }

    /**
     * Validate IP Address (supports IPv4 and IPv6)
     */
    static validateIPAddress(ip: string): boolean {
        const ipv4Regex = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$/;
        const ipv6Regex = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i;
        return ipv4Regex.test(ip) || ipv6Regex.test(ip);
    }

    /**
     * Detect potential SQL injection keywords (very basic)
     */
    static detectSQLInjection(input: string): boolean {
        const patterns = [/SELECT\s+.*FROM/i, /DROP\s+TABLE/i, /UNION\s+SELECT/i, /OR\s+1=1/i, /--\s/];
        return patterns.some(p => p.test(input));
    }

    /**
     * Generate a secure CSRF token
     */
    static generateCSRFToken(): string {
        return crypto.randomBytes(32).toString('base64');
    }
}