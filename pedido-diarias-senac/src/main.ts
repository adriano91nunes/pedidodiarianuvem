import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet'; // Importando o helmet

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // SOLUÇÃO DE SEGURANÇA 2: Ativa os cabeçalhos protetores do Helmet
  app.use(helmet());

  // SOLUÇÃO DE SEGURANÇA 3: Ativa o CORS restringindo a origem para o seu Frontend SPA
  app.enableCors({
    origin: 'http://localhost:5173', // Porta padrão onde o Vite/React vai rodar
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Validação global dos DTOs que já tínhamos configurado
  // SOLUÇÃO DE SEGURANÇA 4: whitelist garante que campos não listados no DTO sejam descartados
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('Pedido de Diárias - SENAC-RS')
    .setDescription('API para gestão e cálculo automatizado de diárias públicas')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log(`Aplicação rodando em: http://localhost:3000/api`);
}
bootstrap();