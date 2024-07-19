import { Body, Controller, Post, Res } from '@nestjs/common'
import { LoginCredentialsDto, LoginService } from './login.service'
import { Response } from 'express'

@Controller('auth/login')
export class LoginController {
	constructor(private readonly loginService: LoginService) {}

	@Post()
	async login(@Body() loginCredentialsDto: LoginCredentialsDto, @Res({ passthrough: true }) res: Response) {
		const response = await this.loginService.login(loginCredentialsDto)

		if (response.status === 'error') {
			return response
		}

		res.cookie('jwt', response.data.jwt)
		delete response.data.jwt
		return response
	}
}
