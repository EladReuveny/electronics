import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  healthCheck() {
    return {
      status: 'OK',
      message: 'Server is healthy',
      timestamp: new Date().toLocaleString(),
    };
  }
}
