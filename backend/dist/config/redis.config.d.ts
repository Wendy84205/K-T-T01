declare const _default: (() => {
    enabled: boolean;
    host: string;
    port: number;
    password: string;
    db: number;
    tls: boolean;
    maxRetriesPerRequest: number;
    connectTimeout: number;
    defaultTtl: number;
    prefix: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    enabled: boolean;
    host: string;
    port: number;
    password: string;
    db: number;
    tls: boolean;
    maxRetriesPerRequest: number;
    connectTimeout: number;
    defaultTtl: number;
    prefix: string;
}>;
export default _default;
