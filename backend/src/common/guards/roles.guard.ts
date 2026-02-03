import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userRoles: any[] = Array.isArray(user.roles) ? user.roles : [];
    const hasRole = requiredRoles.some((requiredRole) =>
      userRoles.some(userRole => {
        const name = (typeof userRole === 'string' ? userRole : userRole?.name) || '';
        const lowerName = name.toLowerCase();
        const lowerRequired = requiredRole.toLowerCase();
        return lowerName === lowerRequired || lowerName.includes(lowerRequired);
      })
    );

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
