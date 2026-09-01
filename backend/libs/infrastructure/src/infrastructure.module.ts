import { Module } from '@nestjs/common';
import { InfrastructureService } from './infrastructure.service';

@Module({
  providers: [InfrastructureService],
  exports: [InfrastructureService],
})
export class InfrastructureModule {}
