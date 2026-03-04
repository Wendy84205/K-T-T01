export class ApiResponseDto<T> {
    success: boolean;
    statusCode: number;
    message?: string;
    data?: T;
    error?: any;
    timestamp: string;

    constructor(partial: Partial<ApiResponseDto<T>>) {
        Object.assign(this, partial);
        this.timestamp = new Date().toISOString();
    }
}
