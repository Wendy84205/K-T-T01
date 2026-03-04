import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class DeviceTrustGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const fingerprint = request.fingerprint || request.headers['x-device-fingerprint'];

        if (!user) {
            throw new UnauthorizedException('Authentication required');
        }

        // In a real system, we'd check if this fingerprint exists in user's trusted devices in DB.
        // For now, we'll ensure the fingerprint is present as a basic check.
        if (!fingerprint) {
            throw new UnauthorizedException('Unrecognized or invalid device signature');
        }

        // Attach to user for logging downstream
        user.currentFingerprint = fingerprint;

        return true;
    }
}
