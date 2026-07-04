import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma.service'; // Injetando o nosso banco de dados
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class DiariasService {
  // Ajustamos o construtor para receber tanto o Prisma quanto o cliente do RabbitMQ
  constructor(
    private readonly prisma: PrismaService,
    @Inject('NOTIFICACAO_SERVICE') private readonly client: ClientProxy,
  ) {}

  async create(dadosDoPedido: any) {
    // Definição de Valores Base e Validação de Cargo
    const cargosValidos = {
      'OPERACIONAL': 200,
      'TECNICO': 350,
      'GESTAO': 600
    };

    if (!cargosValidos[dadosDoPedido.cargo]) {
      throw new BadRequestException(
        `O cargo '${dadosDoPedido.cargo}' não é válido. Escolha entre: OPERACIONAL, TECNICO ou GESTAO.`
      );
    }

    const valorBase = cargosValidos[dadosDoPedido.cargo];

    // Regra do Destino: Se for Porto Alegre ou Brasília, aumenta 30%
    let valorCalculado = valorBase;
    const destinoInformado = dadosDoPedido.destino.toUpperCase();
    const destinosEspeciais = ['PORTO ALEGRE', 'BRASILIA'];
    
    if (destinosEspeciais.includes(destinoInformado)) {
      valorCalculado = valorCalculado * 1.30;
    }

    // Regra da Pernoite: Se NÃO teve pernoite (bate-volta), paga só metade (50%)
    if (dadosDoPedido.temPernoite === false) {
      valorCalculado = valorCalculado * 0.5;
    }

    // Salva a diária no banco PostgreSQL do Docker e guarda o resultado na constante
    const novaDiaria = await this.prisma.diaria.create({
      data: {
        destino: dadosDoPedido.destino,
        temPernoite: !!dadosDoPedido.temPernoite, // Garante que vira um booleano
        valorTotal: valorCalculado,
        servidorId: Number(dadosDoPedido.servidorId), // Vincula a diária ao ID de um Servidor real
      },
    });

    // MÁGICA DA MENSAGERIA: Dispara o evento de forma assíncrona para a fila do RabbitMQ
    this.client.emit('diaria_criada', {
      id: novaDiaria.id,
      valorTotal: novaDiaria.valorTotal,
      destino: novaDiaria.destino,
      timestamp: new Date(),
    });

    // Retorna a diária criada para o Controller (mantendo o comportamento original)
    return novaDiaria;
  }

  // SOLUÇÃO DE PERFORMANCE 1: Função para listar todas as diárias cadastradas com PAGINAÇÃO
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const dados = await this.prisma.diaria.findMany({
      skip: Number(skip),
      take: Number(limit),
      include: {
        servidor: true,
      },
    });

    const total = await this.prisma.diaria.count();

    return {
      dados,
      meta: {
        totalRegistros: total,
        paginaAtual: Number(page),
        limitePorPagina: Number(limit),
        totalPaginas: Math.ceil(total / limit),
      },
    };
  }

  // ROTA DO CRUD: Método para ATUALIZAR os dados de uma diária existente pelo ID
  async update(id: number, dadosAtualizados: any) {
    const diariaExistente = await this.prisma.diaria.findUnique({
      where: { id: Number(id) }
    });

    if (!diariaExistente) {
      throw new BadRequestException(`Diária com o ID ${id} não foi encontrada.`);
    }

    const dadosFinais = { ...diariaExistente, ...dadosAtualizados };

    const cargosValidos = { 'OPERACIONAL': 200, 'TECNICO': 350, 'GESTAO': 600 };
    const valorBase = cargosValidos[dadosFinais.cargo] || 200;
    
    let valorCalculado = valorBase;
    const destinoInformado = dadosFinais.destino.toUpperCase();
    if (['PORTO ALEGRE', 'BRASILIA'].includes(destinoInformado)) {
      valorCalculado = valorCalculado * 1.30;
    }
    if (dadosFinais.temPernoite === false) {
      valorCalculado = valorCalculado * 0.5;
    }

    return this.prisma.diaria.update({
      where: { id: Number(id) },
      data: {
        destino: dadosAtualizados.destino,
        temPernoite: dadosAtualizados.temPernoite !== undefined ? !!dadosAtualizados.temPernoite : undefined,
        valorTotal: valorCalculado,
        servidorId: dadosAtualizados.servidorId ? Number(dadosAtualizados.servidorId) : undefined,
      },
    });
  }

  // ROTA DO CRUD: Método para DELETAR uma diária do banco pelo ID
  async remove(id: number) {
    const diariaExistente = await this.prisma.diaria.findUnique({
      where: { id: Number(id) }
    });

    if (!diariaExistente) {
      throw new BadRequestException(`Diária com o ID ${id} não existe no banco.`);
    }

    return this.prisma.diaria.delete({
      where: { id: Number(id) },
    });
  }
}