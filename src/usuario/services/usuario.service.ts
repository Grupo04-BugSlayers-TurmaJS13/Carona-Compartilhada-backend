import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { Bcrypt } from '../../auth/bcrypt/bcrypt';
import { differenceInYears, format } from 'date-fns';



@Injectable()
export class UsuarioService {
    constructor(
        @InjectRepository(Usuario)
        private usuarioRepository: Repository<Usuario>,
        private bcrypt: Bcrypt
    ) { }

    async findByUsuario(usuario: string): Promise<Usuario | null> {

        if (usuario === null || usuario === undefined)
            throw new HttpException('O nome de usuário é obrigatório!', HttpStatus.BAD_REQUEST);

        const usuarioEncontrado = await this.usuarioRepository.findOne({
            where: { usuario: usuario },
            relations: { viagens: true }
        });

        return usuarioEncontrado ? this.formatarUsuario(usuarioEncontrado) : null
    }

    async findAll(): Promise<any[]> {

        const usuarios = await this.usuarioRepository.find({
            relations: { viagens: true }
        });

        return usuarios.map(usuario => this.formatarUsuario(usuario));
    }

    async findById(id: number): Promise<any> {

        const usuario = await this.usuarioRepository.findOne({
            where: { id },
            relations: { viagens: true }
        });

        if (!usuario)
            throw new HttpException('Usuario não encontrado!', HttpStatus.NOT_FOUND);

        return this.formatarUsuario(usuario);
    }
    async create(usuario: Usuario): Promise<Usuario> {

        const buscaUsuario = await this.findByUsuario(usuario.usuario);

        if (buscaUsuario)
            throw new HttpException("O Usuario já existe!", HttpStatus.BAD_REQUEST);

        usuario.senha = await this.bcrypt.criptografarSenha(usuario.senha)
        const usuarioSalvo = await this.usuarioRepository.save(usuario);

        return this.formatarUsuario(usuarioSalvo);
    }

    async update(usuario: Usuario): Promise<Usuario> {

        await this.findById(usuario.id);

        const buscaUsuario = await this.findByUsuario(usuario.usuario);

        if (buscaUsuario && buscaUsuario.id !== usuario.id)
            throw new HttpException('Usuário (e-mail) já Cadastrado!', HttpStatus.BAD_REQUEST);

        usuario.senha = await this.bcrypt.criptografarSenha(usuario.senha)

        const usuarioAtualizado = await this.usuarioRepository.save(usuario);

        return this.formatarUsuario(usuarioAtualizado);

    }

    private formatarUsuario(usuario: Usuario): any {

        const data = new Date(usuario.data_nascimento);

        const idade = differenceInYears(
            new Date(),
            data
        );

        const { senha, ...usuarioSemSenha } = usuario;


        return {
            ...usuarioSemSenha,
            data_nascimento: format(data, "dd/MM/yyyy"),
            idade: idade
        };
    }

}