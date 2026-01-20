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
exports.MessageReadReceipt = void 0;
const typeorm_1 = require("typeorm");
const message_entity_1 = require("./message.entity");
const user_entity_1 = require("../core/user.entity");
let MessageReadReceipt = class MessageReadReceipt {
};
exports.MessageReadReceipt = MessageReadReceipt;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MessageReadReceipt.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'message_id', type: 'char', length: 36 }),
    __metadata("design:type", String)
], MessageReadReceipt.prototype, "messageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'char', length: 36 }),
    __metadata("design:type", String)
], MessageReadReceipt.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'read_at', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], MessageReadReceipt.prototype, "readAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'read_with_device_id', length: 255, nullable: true }),
    __metadata("design:type", String)
], MessageReadReceipt.prototype, "readWithDeviceId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MessageReadReceipt.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => message_entity_1.Message, message => message.id),
    (0, typeorm_1.JoinColumn)({ name: 'message_id' }),
    __metadata("design:type", message_entity_1.Message)
], MessageReadReceipt.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.id),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], MessageReadReceipt.prototype, "user", void 0);
exports.MessageReadReceipt = MessageReadReceipt = __decorate([
    (0, typeorm_1.Entity)('message_read_receipts')
], MessageReadReceipt);
//# sourceMappingURL=message-read.entity.js.map