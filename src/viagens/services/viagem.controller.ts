import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ViagensService } from '../viagens.service';
import { CreateViagenDto } from '../dto/create-viagem.dto';
import { UpdateViagenDto } from '../dto/update-viagem.dto';

@Controller('viagens')
export class ViagensController {
  constructor(private readonly viagensService: ViagensService) {}

  @Post()
  create(@Body() createViagenDto: CreateViagenDto) {
    return this.viagensService.create(createViagenDto);
  }

  @Get()
  findAll() {
    return this.viagensService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.viagensService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateViagenDto: UpdateViagenDto) {
    return this.viagensService.update(id, updateViagenDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.viagensService.remove(id);
  }
}
