import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to enforce a minimum security clearance level on a route
 * @param level Security level (0-5, e.g. 3 for Confidential, 5 for Top Secret)
 */
export const SecurityClearance = (level: number) => SetMetadata('securityClearance', level);
