// src/common/middleware/rate-limiter.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  private requestCounts = new Map<string, { count: number; timestamp: number }>();

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 100;

    const userRequests = this.requestCounts.get(ip);

    if (!userRequests) {
      this.requestCounts.set(ip, { count: 1, timestamp: now });
      return next();
    }

    // Reset counter if window has passed
    if (now - userRequests.timestamp > windowMs) {
      userRequests.count = 1;
      userRequests.timestamp = now;
      this.requestCounts.set(ip, userRequests);
      return next();
    }

    // Check if exceeded limit
    if (userRequests.count >= maxRequests) {
      res.status(429).json({
        message: 'Too many requests, please try again later.',
        retryAfter: Math.ceil((windowMs - (now - userRequests.timestamp)) / 1000),
      });
      return;
    }

    // Increment counter
    userRequests.count++;
    this.requestCounts.set(ip, userRequests);
    
    // Add headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (maxRequests - userRequests.count).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil((userRequests.timestamp + windowMs) / 1000).toString());

    next();
  }
}