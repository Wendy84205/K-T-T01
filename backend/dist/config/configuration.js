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
exports.Configuration = exports.FileConfig = exports.SecurityConfig = exports.AppConfig = exports.JwtConfig = exports.DatabaseConfig = void 0;
exports.validate = validate;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class DatabaseConfig {
    constructor() {
        this.DB_HOST = 'localhost';
        this.DB_PORT = 3306;
        this.DB_USERNAME = 'root';
        this.DB_PASSWORD = '';
        this.DB_DATABASE = 'cybersecure_db';
        this.DB_SYNC = false;
        this.DB_LOGGING = false;
    }
}
exports.DatabaseConfig = DatabaseConfig;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DatabaseConfig.prototype, "DB_HOST", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DatabaseConfig.prototype, "DB_PORT", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DatabaseConfig.prototype, "DB_USERNAME", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DatabaseConfig.prototype, "DB_PASSWORD", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DatabaseConfig.prototype, "DB_DATABASE", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], DatabaseConfig.prototype, "DB_SYNC", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], DatabaseConfig.prototype, "DB_LOGGING", void 0);
class JwtConfig {
    constructor() {
        this.JWT_SECRET = 'dev-secret-key-for-development';
        this.JWT_EXPIRATION = '3600s';
        this.JWT_REFRESH_SECRET = 'dev-refresh-secret-key';
        this.JWT_REFRESH_EXPIRATION = '7d';
    }
}
exports.JwtConfig = JwtConfig;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], JwtConfig.prototype, "JWT_SECRET", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], JwtConfig.prototype, "JWT_EXPIRATION", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], JwtConfig.prototype, "JWT_REFRESH_SECRET", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], JwtConfig.prototype, "JWT_REFRESH_EXPIRATION", void 0);
class AppConfig {
    constructor() {
        this.NODE_ENV = 'development';
        this.PORT = 3001;
        this.API_PREFIX = 'api/v1';
        this.CORS_ORIGIN = 'http://localhost:3000';
    }
}
exports.AppConfig = AppConfig;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AppConfig.prototype, "NODE_ENV", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AppConfig.prototype, "PORT", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AppConfig.prototype, "API_PREFIX", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AppConfig.prototype, "CORS_ORIGIN", void 0);
class SecurityConfig {
    constructor() {
        this.BCRYPT_SALT_ROUNDS = 12;
        this.RATE_LIMIT_WINDOW_MS = 900000;
        this.RATE_LIMIT_MAX = 100;
        this.SESSION_SECRET = 'dev-session-secret';
    }
}
exports.SecurityConfig = SecurityConfig;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SecurityConfig.prototype, "BCRYPT_SALT_ROUNDS", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SecurityConfig.prototype, "RATE_LIMIT_WINDOW_MS", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SecurityConfig.prototype, "RATE_LIMIT_MAX", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SecurityConfig.prototype, "SESSION_SECRET", void 0);
class FileConfig {
    constructor() {
        this.UPLOAD_PATH = './uploads';
        this.MAX_FILE_SIZE = 10485760;
        this.ALLOWED_MIME_TYPES = 'image/jpeg,image/png,application/pdf';
        this.STORAGE_TYPE = 'local';
    }
}
exports.FileConfig = FileConfig;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FileConfig.prototype, "UPLOAD_PATH", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FileConfig.prototype, "MAX_FILE_SIZE", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FileConfig.prototype, "ALLOWED_MIME_TYPES", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FileConfig.prototype, "STORAGE_TYPE", void 0);
class Configuration {
    constructor() {
        this.database = new DatabaseConfig();
        this.jwt = new JwtConfig();
        this.app = new AppConfig();
        this.security = new SecurityConfig();
        this.file = new FileConfig();
    }
}
exports.Configuration = Configuration;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", DatabaseConfig)
], Configuration.prototype, "database", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", JwtConfig)
], Configuration.prototype, "jwt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", AppConfig)
], Configuration.prototype, "app", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", SecurityConfig)
], Configuration.prototype, "security", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", FileConfig)
], Configuration.prototype, "file", void 0);
function validate(config) {
    const validatedConfig = (0, class_transformer_1.plainToClass)(Configuration, config, {
        enableImplicitConversion: true,
    });
    const errors = (0, class_validator_1.validateSync)(validatedConfig, {
        skipMissingProperties: false,
    });
    if (errors.length > 0) {
        throw new Error(errors.toString());
    }
    return validatedConfig;
}
//# sourceMappingURL=configuration.js.map