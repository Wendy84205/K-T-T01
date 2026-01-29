export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  mfaRequired?: boolean;
}

export class CreateUserDtoClass {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  mfaRequired?: boolean = true;
  isActive?: boolean;
  isLocked?: boolean;
  lockReason?: string;
  roles?: string[];
}