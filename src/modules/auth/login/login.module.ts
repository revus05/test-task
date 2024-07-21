import { Module } from '@nestjs/common'
import { LoginController } from './login.controller'
import { LoginService } from './login.service'
import { PrismaModule } from '../../prisma/prisma.module'

@Module({
	imports: [PrismaModule],
	controllers: [LoginController],
	providers: [LoginService],
})
export class LoginModule {}
