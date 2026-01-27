// TODO: Project Module Configuration
// 1. Import required modules
//    - TypeOrmModule.forFeature([Project, Task, AccessRequest, Team, User])
//    - Import NotificationService for sending notifications
// 2. Register ProjectController and ProjectService
// 3. Create TaskService separately for better organization
// 4. Create AccessRequestService for access management
// 5. Export ProjectService for use in other modules
//
// Example structure:
// @Module({
//   imports: [
//     TypeOrmModule.forFeature([Project, Task, AccessRequest, Team, User]),
//   ],
//   controllers: [ProjectController],
//   providers: [ProjectService, TaskService, AccessRequestService, NotificationService],
//   exports: [ProjectService],
// })
// export class ProjectModule {}
