import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract the full user object from the Request
 * Requires an authentication guard (like JwtAuthGuard) to populate request.user
 */
export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);

/**
 * Custom decorator to extract just the User ID from the Request
 */
export const UserId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user?.id || request.user?.sub;
    },
);

/**
 * Custom decorator to extract the roles list from the Request
 */
export const UserRolesList = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user?.roles || [];
    },
);
