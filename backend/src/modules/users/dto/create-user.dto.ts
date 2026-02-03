import { IsString, IsEmail, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsNumber, Min, Max } from 'class-validator';

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  mfaRequired?: boolean;
  isActive?: boolean;
  status?: string;
  roles?: string[];
  employeeId?: string;
  jobTitle?: string;
  department?: string;
  phone?: string;
  securityClearanceLevel?: number;
  avatarUrl?: string;
  totpSecret?: string;
}

export class CreateUserDtoClass {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsBoolean()
  @IsOptional()
  mfaRequired?: boolean = true;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;

  @IsString()
  @IsOptional()
  lockReason?: string;

  @IsArray()
  @IsOptional()
  roles?: string[];

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  employeeId?: string;

  @IsString()
  @IsOptional()
  jobTitle?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  securityClearanceLevel?: number;

  @IsString()
  @IsOptional()
  totpSecret?: string;
}