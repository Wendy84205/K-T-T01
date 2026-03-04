import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse: any =
            exception instanceof HttpException
                ? exception.getResponse()
                : { message: 'Internal server error' };

        const message = typeof exceptionResponse === 'string'
            ? exceptionResponse
            : exceptionResponse.message || 'Internal server error';

        const errorDetails = typeof exceptionResponse === 'object' ? exceptionResponse.error : null;

        const responseBody = {
            success: false,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
            error: errorDetails,
        };

        // Log full errors in development or if critical
        if (status >= 500) {
            console.error(`[GlobalError] ${status} ${request.method} ${request.url}`, exception);
        }

        response.status(status).json(responseBody);
    }
}
