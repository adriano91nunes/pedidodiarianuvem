import { Controller, Post, Get, Patch, Delete, Body, Query, Param, UseInterceptors } from '@nestjs/common'; 
import { CacheInterceptor } from '@nestjs/cache-manager'; // Importado para a Solução de Performance 2
import { DiariasService } from './diarias.service';
import { CreateDiariaDto } from './dto/create-diaria.dto'; 
import { ApiQuery } from '@nestjs/swagger'; // Importado para documentar a paginação no Swagger

@Controller('diarias')
export class DiariasController {
  constructor(private readonly diariasService: DiariasService) {}

  @Post()
  create(@Body() dadosDoPedido: CreateDiariaDto) { 
    return this.diariasService.create(dadosDoPedido);
  }

  // SOLUÇÃO DE PERFORMANCE 2: Ativa o cache automático por 10 segundos para esta listagem
  @UseInterceptors(CacheInterceptor) 
  @Get()
  // SOLUÇÃO DE PERFORMANCE 1: Adiciona os campos opcionais de paginação na interface do Swagger
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Número da página que deseja visualizar' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Quantidade de registros por página' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    // Passa os parâmetros de paginação capturados da URL diretamente para o service
    return this.diariasService.findAll(page, limit);
  }

  // ROTA DO CRUD: Atualizar Diária por ID
  @Patch(':id')
  update(@Param('id') id: string, @Body() dadosAtualizados: CreateDiariaDto) {
    return this.diariasService.update(Number(id), dadosAtualizados);
  }

  // ROTA DO CRUD: Deletar Diária por ID
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.diariasService.remove(Number(id));
  }
}