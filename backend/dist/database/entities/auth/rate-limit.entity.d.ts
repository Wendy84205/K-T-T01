export declare class RateLimit {
    id: string;
    identifier: string;
    bucketType: string;
    requestCount: number;
    limitValue: number;
    timeWindow: number;
    isBlocked: boolean;
    blockReason: string;
    blockedUntil: Date;
    firstRequestAt: Date;
    lastRequestAt: Date;
    createdAt: Date;
}
