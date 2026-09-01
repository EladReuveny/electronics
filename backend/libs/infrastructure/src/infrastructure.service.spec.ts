import { Test, TestingModule } from '@nestjs/testing';
import { InfrastructureService } from './infrastructure.service';

describe('InfrastructureService', () => {
  let service: InfrastructureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InfrastructureService],
    }).compile();

    service = module.get<InfrastructureService>(InfrastructureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
