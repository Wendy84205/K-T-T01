// TODO: Notification Module Configuration
// 1. Create Notification entity first
//    - Create file: database/entities/notification/notification.entity.ts
// 2. Import required modules
//    - TypeOrmModule.forFeature([Notification])
//    - Import EmailService from common/service
// 3. Register NotificationGateway for WebSocket
// 4. Register NotificationController and NotificationService
// 5. Export NotificationService for use in other modules
//    - SecurityModule can send security alerts
//    - FileStorageModule can send file share notifications
//    - ChatModule can send message notifications
// 6. Configure WebSocket CORS
//
// Example structure:
// @Module({
//   imports: [
//     TypeOrmModule.forFeature([Notification]),
//   ],
//   controllers: [NotificationController],
//   providers: [NotificationService, NotificationGateway, EmailService],
//   exports: [NotificationService],
// })
// export class NotificationModule {}
