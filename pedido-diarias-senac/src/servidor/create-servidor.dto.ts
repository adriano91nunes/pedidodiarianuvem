import { IsNotEmpty, IsString } from 'class-validator'; // Removido o 'In' que causava o erro
import { ApiProperty } from '@nestjs/swagger';

export class CreateServidorDto {
  @ApiProperty({ example: '123456', description: 'Número de matrícula único do servidor' })
  @IsString()
  @IsNotEmpty()
  matricula!: string; // A '!' limpa o erro de falta de inicialização no construtor

  @ApiProperty({ example: 'Adriano', description: 'Nome completo do servidor público' })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({ example: 'TECNICO', description: 'Cargo: OPERACIONAL, TECNICO ou GESTAO' })
  @IsString()
  @IsNotEmpty()
  cargo!: string;
}