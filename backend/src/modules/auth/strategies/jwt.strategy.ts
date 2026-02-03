import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // SECURITY: Real-time status check
    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    if (user.status === 'banned') {
      throw new ForbiddenException('Tài khoản của bạn đã bị khóa khẩn cấp do vi phạm chính sách bảo mật.');
    }

    if (user.status === 'pending') {
      throw new ForbiddenException('Tài khoản của bạn đang chờ phê duyệt. Vui lòng quay lại sau.');
    }

    const rolesArr = user.roles.map(r => r.name);

    return {
      userId: user.id,
      email: user.email,
      username: user.username,
      employeeId: user.employeeId,
      securityLevel: user.securityClearanceLevel ?? 1,
      mfaRequired: user.mfaRequired,
      roles: rolesArr,
    };
  }
}