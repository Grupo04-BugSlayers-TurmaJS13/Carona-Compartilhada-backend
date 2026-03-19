import { Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Body, Put, Delete, UseGuards } from "@nestjs/common";
import { Viagem } from "../entities/viagem.entity";
import { ViagemService } from "../services/viagem.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guard/jwt-auth.guard";

@ApiTags('Viagem')
@UseGuards(JwtAuthGuard)
@Controller("/viagens")
@ApiBearerAuth()
export class ViagemController{
    constructor(
        private readonly viagemService: ViagemService
    ){}

    @Get()
    @HttpCode(HttpStatus.OK)
    findAll(): Promise<Viagem[]>{
        return this.viagemService.findAll();
    }

    @Get("/:id")
    @HttpCode(HttpStatus.OK)
    findById(@Param("id", ParseIntPipe)id: number): Promise<Viagem>{
        return this.viagemService.findByid(id);
    }

    @Get("/destino/:destino")
    @HttpCode(HttpStatus.OK)
    findByDestino(@Param("destino")destino: string): Promise<Viagem>{
        return this.viagemService.findByDestino(destino);
    }

    
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body()viagem: Viagem): Promise<Viagem>{
        return this.viagemService.create(viagem);
    }

    @Put()
    @HttpCode(HttpStatus.OK)
    update(@Body()viagem: Viagem): Promise<Viagem>{
        return this.viagemService.update(viagem);
    }

    @Delete("/:id")
    @HttpCode(HttpStatus.NO_CONTENT)
    delete(@Param("id", ParseIntPipe)id: number){
        return this.viagemService.delete(id);
    }

    @Put("/concluir/")
    @HttpCode(HttpStatus.OK)
    encerrarViagem(@Body("id", ParseIntPipe)id: number, @Body("dataEncerramento")dataencerramento: Date): Promise<Viagem>{
        return this.viagemService.encerrarViagem(id,dataencerramento);
    }
}