import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    message?: string;
    data: T;
    timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const statusCode = response.statusCode;

        return next.handle().pipe(
            map((data: any) => {
                // Extract optional message if data is an object with 'message' and 'results'
                let message = 'Operation successful';
                let payload = data;

                if (data && typeof data === 'object' && 'message' in data && 'results' in data) {
                    message = data.message;
                    payload = data.results;
                } else if (data && typeof data === 'object' && 'message' in data) {
                    message = data.message;
                    payload = data.data !== undefined ? data.data : data;
                }

                return {
                    success: true,
                    statusCode,
                    message,
                    data: payload,
                    timestamp: new Date().toISOString(),
                };
            }),
        );
    }
}
