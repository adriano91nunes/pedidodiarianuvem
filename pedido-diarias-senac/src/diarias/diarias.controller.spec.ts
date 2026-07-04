import { Test, TestingModule } from '@nestjs/testing';
import { DiariasController } from './diarias.controller';
import { DiariasService } from './diarias.service';

describe('DiariasController', () => {
  let controller: DiariasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiariasController],
      providers: [DiariasService],
    }).compile();

    controller = module.get<DiariasController>(DiariasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
