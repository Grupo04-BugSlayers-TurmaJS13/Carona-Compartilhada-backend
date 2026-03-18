import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Bcrypt } from '../bcrypt/bcrypt';
import { UsuarioService } from '../../usuario/services/usuario.service';
import { UsuarioLogin } from '../entities/auth.entity';


@Injectable()
export class AuthService {

    constructor(
        private usuarioService: UsuarioService,
        private jwtService: JwtService,
        private bcrypt: Bcrypt
    ) { }

    async validateUser(username: string, password: string): Promise<any> {

        const buscaUsuario = await this.usuarioService.findByUsuario(username)

        console.log("Usuário digitado:", username)
        console.log("Senha digitada:", password)

        if (!buscaUsuario) {
            console.log("Usuário não encontrado")
            return null
        }

        const matchPassword = await this.bcrypt.compararSenhas(
            password,
            buscaUsuario.senha
        )

        if (matchPassword) {
            const { senha, ...resposta } = buscaUsuario
            return resposta
        }

        return null
    }

    async login(usuarioLogin: UsuarioLogin) {

        const buscaUsuario = await this.usuarioService.findByUsuario(usuarioLogin.usuario)

        if (!buscaUsuario)
            throw new HttpException(
                'Usuário não encontrado!',
                HttpStatus.NOT_FOUND
            )

        const matchPassword = await this.bcrypt.compararSenhas(
            usuarioLogin.senha,
            buscaUsuario.senha
        )

        if (!matchPassword)
            throw new HttpException(
                'Senha incorreta!',
                HttpStatus.UNAUTHORIZED
            )

        const payload = { sub: buscaUsuario.usuario }

        return {
            id: buscaUsuario.id,
            nome: buscaUsuario.nome,
            usuario: buscaUsuario.usuario,
            foto: buscaUsuario.foto,
            token: `Bearer ${this.jwtService.sign(payload)}`
        }
    }
}