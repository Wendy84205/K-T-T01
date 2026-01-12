import { ConfigService } from '@nestjs/config';
export declare class ConfigurationService {
    private configService;
    constructor(configService: ConfigService);
    get app(): any;
    get database(): any;
    get jwt(): any;
    get security(): any;
    get file(): any;
    get email(): any;
    get redis(): any;
    get isDevelopment(): boolean;
    get isProduction(): boolean;
    get isTest(): boolean;
    get apiUrl(): string;
    get typeOrmConfig(): {
        type: string;
        host: any;
        port: any;
        username: any;
        password: any;
        database: any;
        entities: string[];
        synchronize: any;
        logging: any;
        migrationsRun: any;
        dropSchema: any;
        extra: {
            connectionLimit: any;
            connectTimeout: any;
        };
        ssl: boolean | {
            cert: any;
            key: any;
            ca: any;
            rejectUnauthorized: boolean;
        };
    };
}
