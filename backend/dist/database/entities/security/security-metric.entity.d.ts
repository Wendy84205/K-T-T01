export declare class SecurityMetric {
    id: string;
    metricDate: Date;
    metricType: string;
    totalCount: number;
    successCount: number;
    failureCount: number;
    breakdown: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
