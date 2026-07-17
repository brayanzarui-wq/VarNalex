import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      service: 'varnalex-api',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
