import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { jwtConstants } from "./constants/constants";
import { Bcrypt } from "./bcrypt/bcrypt";
import { LocalStrategy } from "./strategy/local-strategy";
import { JwtStrategy } from "./strategy/jwt.strategy";
import { AuthController } from "./controllers/auth.controller";
import { UsuarioModule } from "../usuario/usuario.module";
import { AuthService } from "./services/auth.service";


@Module({
    imports: [
        forwardRef(() => UsuarioModule),
        PassportModule,
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '1h' },
        }),
    ],
    providers: [Bcrypt, AuthService, LocalStrategy, JwtStrategy],
    controllers: [AuthController],
    exports: [Bcrypt],
})
export class AuthModule { } { };