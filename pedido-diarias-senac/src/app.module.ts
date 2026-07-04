import { Module, Global } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiariasModule } from './diarias/diarias.module';
import { PrismaService } from './prisma.service';
import { ServidorModule } from './servidor/servidor.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager'; // Importação do Cache

@Global()
@Module({
  imports: [
    DiariasModule, 
    ServidorModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    // SOLUÇÃO DE PERFORMANCE 2: Ativa cache em memória por 10 segundos (10000 ms)
    CacheModule.register({
      ttl: 10000, 
      isGlobal: true, // Deixa o cache disponível para a aplicação toda
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [PrismaService],
})
export class AppModule {}