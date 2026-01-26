import { IsString, IsNotEmpty } from 'class-validator';

export class MfaVerifyDto {
  @IsString()
  @IsNotEmpty({ message: 'MFA token is required' })
  token: string;

  @IsString()
  @IsNotEmpty({ message: 'Temporary token is required' })
  tempToken: string;
}
