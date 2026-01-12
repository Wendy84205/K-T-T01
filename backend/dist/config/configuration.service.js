"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ConfigurationService = class ConfigurationService {
    constructor(configService) {
        this.configService = configService;
    }
    get app() {
        return this.configService.get('app');
    }
    get database() {
        return this.configService.get('database');
    }
    get jwt() {
        return this.configService.get('jwt');
    }
    get security() {
        return this.configService.get('security');
    }
    get file() {
        return this.configService.get('file');
    }
    get email() {
        return this.configService.get('email');
    }
    get redis() {
        return this.configService.get('redis');
    }
    get isDevelopment() {
        return this.app?.nodeEnv === 'development';
    }
    get isProduction() {
        return this.app?.nodeEnv === 'production';
    }
    get isTest() {
        return this.app?.nodeEnv === 'test';
    }
    get apiUrl() {
        return `${this.app?.apiUrl}/${this.app?.apiPrefix}`;
    }
    get typeOrmConfig() {
        return {
            type: 'mysql',
            host: this.database?.host,
            port: this.database?.port,
            username: this.database?.username,
            password: this.database?.password,
            database: this.database?.database,
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: this.database?.synchronize,
            logging: this.database?.logging,
            migrationsRun: this.database?.migrationsRun,
            dropSchema: this.database?.dropSchema,
            extra: {
                connectionLimit: this.database?.maxConnections,
                connectTimeout: this.database?.connectionTimeout,
            },
            ssl: this.database?.ssl
                ? {
                    cert: this.database?.sslCert,
                    key: this.database?.sslKey,
                    ca: this.database?.sslCa,
                    rejectUnauthorized: false,
                }
                : false,
        };
    }
};
ConfigurationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ConfigurationService);
exports.ConfigurationService = ConfigurationService;
//# sourceMappingURL=configuration.service.js.map