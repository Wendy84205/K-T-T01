import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  /** Email or username */
  @IsString()
  @IsNotEmpty({ message: 'Email or username is required' })
  @MinLength(2, { message: 'Identifier must be at least 2 characters' })
  @MaxLength(255)
  @Transform(({ value }) =>
    typeof value === 'string' ? (value.includes('@') ? value.trim().toLowerCase() : value.trim()) : value,
  )
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}