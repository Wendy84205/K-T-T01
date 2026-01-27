// TODO: MFA Guard
// Verify MFA token before allowing access to protected routes
// @Injectable() export class MfaGuard implements CanActivate {
//   canActivate(context: ExecutionContext): boolean {
//     const request = context.switchToHttp().getRequest();
//     const user = request.user;
//     // Check if user has MFA enabled
//     // If yes, verify MFA token from request header
//     // Return true if verified, false otherwise
//   }
// }
