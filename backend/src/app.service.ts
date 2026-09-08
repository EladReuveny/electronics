import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  healthCheck() {
    return {
      status: HttpStatus.OK,
      message: 'Server is healthy',
      timestamp: new Date().toLocaleString(),
    };
  }
}
