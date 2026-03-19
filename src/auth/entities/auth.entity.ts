import { ApiProperty } from "@nestjs/swagger/dist/decorators/api-property.decorator"


export class UsuarioLogin {
    @ApiProperty()
    usuario: string
    
    @ApiProperty()
    senha: string
}