import { Test, TestingModule } from '@nestjs/testing';
import { DiariasService } from './diarias.service';

describe('DiariasService', () => {
  let service: DiariasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiariasService],
    }).compile();

    service = module.get<DiariasService>(DiariasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
