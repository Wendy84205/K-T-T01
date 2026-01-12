declare const _default: (() => {
    nodeEnv: string;
    port: number;
    apiPrefix: string;
    corsOrigin: string[];
    apiUrl: string;
    frontendUrl: string;
    enableRateLimit: boolean;
    enableCors: boolean;
    enableHelmet: boolean;
    logLevel: string;
    enableRequestLogging: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    nodeEnv: string;
    port: number;
    apiPrefix: string;
    corsOrigin: string[];
    apiUrl: string;
    frontendUrl: string;
    enableRateLimit: boolean;
    enableCors: boolean;
    enableHelmet: boolean;
    logLevel: string;
    enableRequestLogging: boolean;
}>;
export default _default;
