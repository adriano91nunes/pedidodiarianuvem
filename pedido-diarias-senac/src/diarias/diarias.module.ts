import { Module } from '@nestjs/common';
import { DiariasService } from './diarias.service';
import { DiariasController } from './diarias.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NOTIFICACAO_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'],
          queue: 'diarias_notificacao',
          queueOptions: {
            durable: true, // Garante que a fila não some se o cointainer reiniciar
          },
        },
      },
    ]),
  ],
  controllers: [DiariasController],
  providers: [DiariasService],
})
export class DiariasModule {}