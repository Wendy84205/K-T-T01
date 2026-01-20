export class LoginResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    department?: string;
    mfaRequired: boolean;
    mfaVerified?: boolean;
    securityClearanceLevel: number;
  };
}