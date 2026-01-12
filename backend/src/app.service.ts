import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Cybersecure API v1.0 is running!';
  }
}
