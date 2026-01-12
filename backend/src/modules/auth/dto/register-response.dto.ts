export class RegisterResponseDto {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  employeeId: string;  // ⭐ Thêm employeeId vào response
  department?: string;
  jobTitle?: string;
  mfaRequired: boolean;
  isEmailVerified: boolean;
  requiresEmailVerification: boolean;
  requiresManagerApproval: boolean;
  createdAt: Date;
  nextSteps: string[];
}
