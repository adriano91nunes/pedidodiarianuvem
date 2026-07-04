import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ServidorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dados: any) {
    if (!dados.matricula || !dados.nome || !dados.cargo) {
      throw new BadRequestException('Os campos matrícula, nome e cargo são obrigatórios.');
    }

    const matriculaExiste = await this.prisma.servidor.findUnique({
      where: { matricula: dados.matricula },
    });

    if (matriculaExiste) {
      throw new BadRequestException(`A matrícula '${dados.matricula}' já está cadastrada no sistema.`);
    }

    const cargosValidos = ['OPERACIONAL', 'TECNICO', 'GESTAO'];
    if (!cargosValidos.includes(dados.cargo.toUpperCase())) {
      throw new BadRequestException('Cargo inválido. Escolha entre OPERACIONAL, TECNICO ou GESTAO.');
    }

    return this.prisma.servidor.create({
      data: {
        matricula: dados.matricula,
        nome: dados.nome,
        cargo: dados.cargo.toUpperCase(),
      },
    });
  }

  async findAll() {
    return this.prisma.servidor.findMany({
      include: {
        diarias: true,
      },
    });
  }
}