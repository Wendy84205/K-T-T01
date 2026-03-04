import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class MfaGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Check if user is authenticated at all
        if (!user) {
            throw new UnauthorizedException('Authentication required');
        }

        // Check if the user is required to have MFA but has not verified it in this session
        // Our AuthService sets mfaRequired and mfaVerified in the token payload
        const isMfaRequired = user.mfaRequired === true;
        const isMfaVerified = user.mfaVerified === true;

        if (isMfaRequired && !isMfaVerified) {
            throw new UnauthorizedException({
                message: 'MFA verification required for this operation',
                error: 'MFA_REQUIRED_PENDING'
            });
        }

        return true;
    }
}
