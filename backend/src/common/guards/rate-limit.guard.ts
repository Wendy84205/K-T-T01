import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class RateLimitGuard implements CanActivate {
    private readonly clients = new Map<string, { count: number; lastReset: number }>();
    private readonly WINDOW_SIZE = 60 * 1000; // 1 minute
    private readonly MAX_REQUESTS = 100; // limit to 100 requests per minute

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const ip = request.ip || '0.0.0.0';
        const now = Date.now();

        const client = this.clients.get(ip) || { count: 0, lastReset: now };

        if (now - client.lastReset > this.WINDOW_SIZE) {
            client.count = 1;
            client.lastReset = now;
        } else {
            client.count++;
        }

        this.clients.set(ip, client);

        if (client.count > this.MAX_REQUESTS) {
            throw new HttpException('Too many requests, please slow down.', HttpStatus.TOO_MANY_REQUESTS);
        }

        return true;
    }
}
