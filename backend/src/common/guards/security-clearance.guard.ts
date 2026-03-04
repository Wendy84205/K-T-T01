import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class SecurityClearanceGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredClearance = this.reflector.get<number>('securityClearance', context.getHandler());

        if (requiredClearance === undefined) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User authentication required for secure access');
        }

        const userClearance = user.securityLevel || user.securityClearanceLevel || 0;

        if (userClearance < requiredClearance) {
            throw new ForbiddenException(`Insufficient security clearance. Required Level: ${requiredClearance}`);
        }

        return true;
    }
}
