import { Controller, Post, Get, Body } from '@nestjs/common';
import { ServidorService } from './servidor.service';
import { CreateServidorDto } from './create-servidor.dto'; // Importando o DTO novo

@Controller('servidor')
export class ServidorController {
  constructor(private readonly servidorService: ServidorService) {}

  @Post()
  create(@Body() dados: CreateServidorDto) { // Substituído 'any' por 'CreateServidorDto'
    return this.servidorService.create(dados);
  }

  @Get()
  findAll() {
    return this.servidorService.findAll();
  }
}