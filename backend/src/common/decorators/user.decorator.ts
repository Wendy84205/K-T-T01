// TODO: User Decorator
// 1. Create @CurrentUser() decorator
//    - Extract user from request object
//    - Usage: @CurrentUser() user: User
// 2. Extract user ID
//    - @UserId() decorator to get only user ID
//    - Usage: @UserId() userId: string
// 3. Extract user roles
//    - @UserRoles() decorator to get user roles
//    - Usage: @UserRoles() roles: string[]
// 4. Optional user extraction
//    - Support optional user (for public endpoints)
//    - Return null if no user authenticated
// 5. Implementation
//    - Use createParamDecorator from @nestjs/common
//    - Extract from request.user (set by JWT strategy)
//
// Example:
// export const CurrentUser = createParamDecorator(
//   (data: unknown, ctx: ExecutionContext) => {
//     const request = ctx.switchToHttp().getRequest();
//     return request.user;
//   },
// );
