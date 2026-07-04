import { Module } from '@nestjs/common';
import { DiariasService } from './diarias.service';
import { DiariasController } from './diarias.controller';

@Module({
  controllers: [DiariasController],
  providers: [DiariasService],
})
export class DiariasModule {}
