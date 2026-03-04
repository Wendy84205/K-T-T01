import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../service/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private readonly auditService: AuditService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const user = request.user;
        const method = request.method;
        const url = request.url;

        // Only audit mutations (POST, PUT, DELETE, PATCH)
        const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
        if (!isMutation) {
            return next.handle();
        }

        return next.handle().pipe(
            tap((data) => {
                // Log mutation asynchronously
                this.auditService.createAuditLog({
                    userId: user?.id || user?.sub,
                    eventType: 'API_MUTATION',
                    entityType: 'ENDPOINT',
                    description: `${method} ${url} executed by ${user?.username || 'anonymous'}`,
                    ipAddress: request.ip || '0.0.0.0',
                    userAgent: request.headers['user-agent'] || 'Unknown',
                    newValues: request.body, // Log payload (careful about sensitive info in production)
                    severity: 'INFO',
                    metadata: {
                        statusCode: ctx.getResponse().statusCode,
                        method,
                        url
                    }
                }).catch(err => {
                    // Silent fail to avoid interrupting the main flow
                    console.error('AuditInterceptor failed', err);
                });
            }),
        );
    }
}
