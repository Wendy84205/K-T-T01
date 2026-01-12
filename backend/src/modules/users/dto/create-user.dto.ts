// Sử dụng interface
export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  mfaRequired?: boolean;
}

// Hoặc nếu muốn dùng class, bỏ decorators
export class CreateUserDtoClass {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  mfaRequired?: boolean = true;
}