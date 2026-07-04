import { IsNotEmpty, IsString, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDiariaDto {
  @ApiProperty({ example: 'Porto Alegre', description: 'Cidade de destino da viagem' })
  @IsString()
  @IsNotEmpty()
  destino!: string;

  @ApiProperty({ example: true, description: 'Informa se haverá pernoite na viagem' })
  @IsBoolean()
  @IsNotEmpty()
  temPernoite!: boolean;

  @ApiProperty({ example: 'TECNICO', description: 'Cargo: OPERACIONAL, TECNICO ou GESTAO' })
  @IsString()
  @IsNotEmpty()
  cargo!: string;

  @ApiProperty({ example: 1, description: 'ID do Servidor real cadastrado no banco' })
  @IsNumber()
  @IsNotEmpty()
  servidorId!: number;
}