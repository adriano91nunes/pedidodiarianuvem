import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // Isso garante que a conexão com o arquivo SQLite ocorra assim que a API subir
    await this.$connect();
  }
}