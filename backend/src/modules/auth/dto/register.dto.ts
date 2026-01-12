import { 
  IsEmail, 
  IsString, 
  IsNotEmpty, 
  MinLength, 
  MaxLength, 
  Matches, 
  IsOptional, 
  IsBoolean,
  IsIn
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(255, { message: 'Email must be less than 255 characters' })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(50, { message: 'Username must be less than 50 characters' })
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'Username can only contain letters, numbers, dots, underscores and hyphens',
  })
  username: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(100, { message: 'Password must be less than 100 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must contain at least one uppercase, lowercase, number and special character',
  })
  password: string;

  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(100, { message: 'First name must be less than 100 characters' })
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(100, { message: 'Last name must be less than 100 characters' })
  lastName: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be valid international format',
  })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Job title must be a string' })
  @MaxLength(100, { message: 'Job title must be less than 100 characters' })
  jobTitle?: string;

  @IsOptional()
  @IsString({ message: 'Department must be a string' })
  @IsIn(['IT', 'SECURITY', 'HR', 'FINANCE', 'OPERATIONS', 'SALES', 'MARKETING', 'DEVELOPMENT'], {
    message: 'Department must be one of: IT, SECURITY, HR, FINANCE, OPERATIONS, SALES, MARKETING, DEVELOPMENT'
  })
  department?: string = 'IT';

  @IsOptional()
  @IsBoolean({ message: 'MFA required must be boolean' })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return true; // default true
  })
  mfaRequired?: boolean = true;
}
